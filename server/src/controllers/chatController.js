const { v4: uuidv4 } = require('uuid');
const claudeService = require('../services/claudeService');
const prisma = require('../prismaClient');
const redis = require('redis');

// Redis client for session caching (survives restarts with persistence)
const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  // Enable persistence by configuring Redis server with AOF or RDB
});

// Redis connection handling
redisClient.on('error', (err) => {
  console.error('❌ Redis connection error:', err);
});

redisClient.on('connect', () => {
  console.log('✅ Connected to Redis');
});

// Connect to Redis
redisClient.connect().catch(console.error);

// Auto-save configuration
const AUTO_SAVE_MESSAGE_THRESHOLD = 5; // Save every 5 messages
const AUTO_SAVE_TIME_INTERVAL = 5 * 60 * 1000; // Save every 5 minutes
const CONVERSATION_TTL = 24 * 60 * 60; // 24 hours TTL for Redis

// Redis helper functions
const redisHelpers = {
  async getConversation(userId, sessionId) {
    try {
      const key = `chat:${userId}:${sessionId}`;
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('❌ Redis get error:', error);
      return null;
    }
  },

  async setConversation(userId, sessionId, messages) {
    try {
      const key = `chat:${userId}:${sessionId}`;
      await redisClient.setEx(key, CONVERSATION_TTL, JSON.stringify(messages));
      return true;
    } catch (error) {
      console.error('❌ Redis set error:', error);
      return false;
    }
  },

  async deleteConversation(userId, sessionId) {
    try {
      const key = `chat:${userId}:${sessionId}`;
      await redisClient.del(key);
      return true;
    } catch (error) {
      console.error('❌ Redis delete error:', error);
      return false;
    }
  },

  async getAllUserConversations(userId) {
    try {
      const pattern = `chat:${userId}:*`;
      const keys = await redisClient.keys(pattern);
      const conversations = {};

      for (const key of keys) {
        const sessionId = key.split(':')[2];
        const messages = await this.getConversation(userId, sessionId);
        if (messages) {
          conversations[sessionId] = messages;
        }
      }

      return conversations;
    } catch (error) {
      console.error('❌ Redis get all conversations error:', error);
      return {};
    }
  },

  // Cache conversation list for 30 seconds to reduce DB load
  async getCachedConversations(userId) {
    try {
      const key = `conversations:${userId}`;
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('❌ Redis get cached conversations error:', error);
      return null;
    }
  },

  async setCachedConversations(userId, conversations) {
    try {
      const key = `conversations:${userId}`;
      await redisClient.setEx(key, 30, JSON.stringify(conversations)); // 30 second TTL
      return true;
    } catch (error) {
      console.error('❌ Redis set cached conversations error:', error);
      return false;
    }
  },

  async invalidateConversationsCache(userId) {
    try {
      const key = `conversations:${userId}`;
      await redisClient.del(key);
      return true;
    } catch (error) {
      console.error('❌ Redis invalidate conversations cache error:', error);
      return false;
    }
  }
};

// Auto-save function
async function autoSaveConversation(userId, sessionId, messages, force = false) {
  try {
    const messageCount = messages.filter(msg => msg.role === 'user').length;

    // Auto-save conditions
    const shouldSave = force ||
                      messageCount >= AUTO_SAVE_MESSAGE_THRESHOLD ||
                      messageCount > 0; // Save any conversation with messages

    if (!shouldSave) return;

    // Generate title from second user message
    const userMessages = messages.filter(msg => msg.role === 'user');
    let title = 'Draft Conversation';
    if (userMessages.length >= 2) {
      const secondMessage = userMessages[1].content;
      title = generateTitleFromMessage(secondMessage);
    }

    // Extract offense type if available (from second message if it's the offense type question)
    let offenseType = null;
    if (userMessages.length >= 2) {
      const secondMessage = userMessages[1].content.toLowerCase();
      if (secondMessage.includes('driving')) offenseType = 'Driving offences';
      else if (secondMessage.includes('tv') || secondMessage.includes('licensing')) offenseType = 'TV licensing';
      else if (secondMessage.includes('professional') || secondMessage.includes('regulation')) offenseType = 'Professional regulation';
      else if (secondMessage.includes('minor') || secondMessage.includes('criminal')) offenseType = 'Minor criminal offences';
    }

    // Check if draft already exists for this conversation
    const existingDraft = await prisma.draftConversation.findUnique({
      where: {
        userId_sessionId: { userId, sessionId }
      }
    });

    const isUpdate = !!existingDraft;

    // Save to database
    await prisma.draftConversation.upsert({
      where: {
        userId_sessionId: { userId, sessionId }
      },
      update: {
        title,
        messages: JSON.stringify(messages),
        offenseType,
        updatedAt: new Date()
      },
      create: {
        userId,
        sessionId,
        title,
        messages: JSON.stringify(messages),
        offenseType
      }
    });

    console.log(`💾 [AUTO-SAVE] ${isUpdate ? 'Updated' : 'Created'} draft conversation:`, { userId, sessionId, messageCount, title });

  } catch (error) {
    console.error('❌ Auto-save error:', error);
  }
}

// Helper function for title generation (extracted for reuse)
function generateTitleFromMessage(message) {
  // Handle null, undefined, or non-string inputs
  if (!message || typeof message !== 'string' || message.length === 0) {
    return 'Starting consultation...';
  }

  let cleanMessage = message.trim();
  cleanMessage = cleanMessage.replace(/^[^a-zA-Z0-9]+/, '').replace(/[^a-zA-Z0-9]+$/, '');

  if (cleanMessage.length <= 3) return cleanMessage || 'Starting consultation...';

  let title = cleanMessage.substring(0, 25);
  const lastSpace = title.lastIndexOf(' ');
  if (lastSpace > 10) {
    title = title.substring(0, lastSpace);
  }

  title = title.charAt(0).toUpperCase() + title.slice(1).toLowerCase();

  if (title.length < cleanMessage.length) {
    title += '...';
  }

  return title || 'Starting consultation...';
}

// Structured questions from main.py
const structuredQuestions = [
  "I'd like to start by getting to know you a bit better. Could you tell me about your work? I'm interested in your profession, how long you've been qualified, your typical working hours, and what your working pattern is like.",
  "What type of offence are you facing? Please choose from: Driving offences, TV licensing, Professional regulation, Minor criminal offences",
  "I need to understand who will be receiving this mitigation statement. Could you let me know who you intend to present this to?",
  "If you're unable to attend the hearing in person, would you mind sharing the reasons why? This can be important context for the panel or court.",
  "Now, let's talk about the situation you're facing. What specific charges or allegations are you dealing with, and who has brought them forward - is it your employer, a regulatory tribunal, or a court?",
  "I know this might be difficult to discuss, but could you walk me through what happened? Take your time - I'm here to listen and help.",
  "Help me understand what led to this situation. What were you thinking at the time? Was this something intentional, perhaps a lapse in judgment, or maybe due to lack of training or oversight? There's no judgment here - I just need to understand.",
  "When the issue first came to light, were you able to admit to the offence or charge straight away?",
  "How did you handle the situation when it was discovered? Were you able to cooperate with your employer, the regulator, or the police?",
  "Do you feel able to acknowledge your role and responsibility in what happened? This is often an important part of the process.",
  "Reflecting on this experience, what lessons have you learned? Can you share any insights about how your actions may have affected others - perhaps clients, colleagues, or the public?",
  "I'd like to understand the personal impact on you. How do you think these allegations or charges will affect you moving forward?",
  "Let's talk about your personal circumstances, as these can be relevant for mitigation. Are you married, single, or in a relationship?",
  "Do you have any children? Family circumstances can be important context.",
  "If you do have children, do any of them have specific needs such as Autism or ADHD? This kind of information can be relevant.",
  "I hope you don't mind me asking - do you have any health conditions that might be relevant to your situation?",
  "Are you the sole earner in your household? This can be important when considering the impact of any sanctions.",
  "Are you currently receiving any social security benefits or disability benefits such as income support?",
  "Do you have any debts or financial obligations that might be relevant?",
  "If you do have debts, do you have a payment plan in place to manage them?",
  "Were there any personal circumstances that might have contributed to the situation? I'm thinking of things like physical or mental health issues, burnout, or work-related pressure.",
  "Sometimes workplace factors can contribute to these situations. Were there any systemic or organizational issues involved - perhaps understaffing, lack of training, unclear protocols, feeling unsupported, or pressure from management or peers?",
  "Looking ahead, how would a disciplinary sanction such as suspension or conditions on your practice affect your livelihood?",
  "This is important for your statement - are you able to express genuine remorse for what has happened?",
  "Have you undertaken any reflective work or participated in reflective practice since this occurred? This can be valuable.",
  "If you have completed any reflective work, would you be comfortable sharing it with the panel or court as an appendix to your mitigation statement?",
  "Have you undertaken any courses, continuing professional development, or remedial training since the allegations arose? If so, what were they focused on, and do you have proof of attendance?",
  "Can you tell me about any past involvement you've had in teaching, mentoring, or quality improvement initiatives? This helps show your commitment to the profession.",
  "Have you made any changes to your practice or decision-making processes as a result of this experience?",
  "Prior to this incident, did you have an unblemished professional record?",
  "How have you contributed to your profession or community over the years? This can be important context for the panel.",
  "We touched on this earlier, but how do you think these allegations or charges will impact you personally and professionally?",
  "Are you able to obtain good character references from colleagues or clients to present to the panel or court? Please note that any character referee must state in their reference that they are aware of the allegations.",
  "Finally, how can you reassure the panel or court that this won't happen again? What steps have you taken or will you take?",
  "Is there anything else you'd like to share or add that you think would be important for the panel or court to know about your situation?"
];

function isPositiveResponse(response) {
  const response_lower = response.toLowerCase().trim();
  return ['yes', 'yeah', 'yep', 'ok', 'sure', 'ready', 'go', 'start'].some(word =>
    response_lower.includes(word)
  );
}

function getConversationState(conversation) {
  const userMessages = conversation
    .filter(msg => msg.role === 'user')
    .map(msg => msg.content);

  if (userMessages.length === 0) {
    return "initial";
  }

  // Check if user has ever given a positive response to start the questionnaire
  const hasPositiveResponse = userMessages.some(msg => isPositiveResponse(msg));

  if (!hasPositiveResponse) {
    return "not_ready";
  }

  // User has given at least one positive response, determine questionnaire state
  const firstPositiveIndex = userMessages.findIndex(msg => isPositiveResponse(msg));

  if (firstPositiveIndex === 0) {
    // Started with positive response
    return userMessages.length === 1 ? "questions_start" : "questions_continue";
  } else {
    // Started with negative, then became positive
    const messagesAfterPositive = userMessages.slice(firstPositiveIndex + 1);
    return messagesAfterPositive.length === 0 ? "questions_start" : "questions_continue";
  }
}

function generateFollowUpQuestions(conversation) {
  const state = getConversationState(conversation);

  // Handle different states
  if (state === "initial") {
    return ["readiness_check"];
  } else if (state === "not_ready") {
    return ["not_ready"];
  } else if (state === "questions_start") {
    return [structuredQuestions[0]];
  } else if (state === "questions_continue") {
    // Get user messages
    const userMessages = conversation
      .filter(msg => msg.role === 'user')
      .map(msg => msg.content);

    // Find the first positive response (which starts the questionnaire)
    const firstPositiveIndex = userMessages.findIndex(msg => isPositiveResponse(msg));

    // Skip all messages up to and including the first positive response
    const skipCount = firstPositiveIndex + 1;
    const actualResponses = userMessages.slice(skipCount);

    // Check if last answer is too short
    if (actualResponses.length > 0 && actualResponses[actualResponses.length - 1].trim().length < 2) {
      return ["Could you provide a bit more detail? Even a sentence or two would be helpful."];
    }

    // Count good answers (responses with meaningful content)
    const goodAnswers = actualResponses.filter(response => response.trim().length >= 2).length;

    // Return next question or finish
    if (goodAnswers < structuredQuestions.length) {
      return [structuredQuestions[goodAnswers]];
    } else {
      return []; // All questions answered
    }
  }

  return [];
}

const chatController = {
  async handleChat(req, res) {
    try {
      const { message, conversation, sessionId } = req.body;
      const userId = req.user.userId;

      console.log('💬 [DEBUG] Chat request received:', {
        userId,
        message: message?.substring(0, 100) + (message?.length > 100 ? '...' : ''),
        sessionId,
        conversationLength: conversation?.length || 0
      })

      // Generate new session ID if not provided
      const currentSessionId = sessionId || uuidv4();

      // Clean up conversation
      const cleanedConversation = conversation.filter(msg =>
        msg && typeof msg === 'object' &&
        msg.role && msg.content && msg.content.trim()
      );

      // Check if the current message is already in the conversation (it should be the last message)
      const lastMessage = cleanedConversation[cleanedConversation.length - 1];
      const hasCurrentMessage = lastMessage && lastMessage.role === 'user' && lastMessage.content === message;

      // Add current message to conversation for completion check only if not already present
      const conversationWithCurrentMessage = hasCurrentMessage
        ? cleanedConversation
        : [...cleanedConversation, { role: 'user', content: message }];

      console.log('💬 [DEBUG] Cleaned conversation:', {
        originalLength: conversation?.length || 0,
        cleanedLength: cleanedConversation.length,
        withCurrentMessage: conversationWithCurrentMessage.length
      })

      // Initialize user conversations if not exists (Redis handles this automatically)
      // Store conversation session in Redis
      await redisHelpers.setConversation(userId, currentSessionId, cleanedConversation);

      // Simple logic flow - check completion using conversation with current message
      const state = getConversationState(conversationWithCurrentMessage);
      const questions = generateFollowUpQuestions(conversationWithCurrentMessage);

      let responseText;
      let isFinal = false;

      // If no more questions, generate the statement
      if (questions.length === 0 && state === "questions_continue") {
        let formattedResponses; // Declare outside try block for error handling

        try {
          // Extract user responses for Claude service - use conversation with current message
          const userMessages = conversationWithCurrentMessage
            .filter(msg => msg.role === 'user')
            .map(msg => msg.content);

          // Find the first positive response (which starts the questionnaire)
          const firstPositiveIndex = userMessages.findIndex(msg => isPositiveResponse(msg));

          // Skip all messages up to and including the first positive response
          const skipCount = firstPositiveIndex + 1;
          const actualResponses = userMessages.slice(skipCount);

          // Format responses for Claude service
          formattedResponses = actualResponses.map((answer, index) => ({
            question: structuredQuestions[index] || `Question ${index + 1}`,
            answer: answer
          }));

          // Extract offense type from the second response (index 1)
          const offenseType = actualResponses[1] || 'general';

          // Generate title from the second user message
          let title = 'Completed Questionnaire';
          if (actualResponses.length >= 2) {
            const secondUserMessage = actualResponses[1];
            let cleanMessage = secondUserMessage.trim();
            cleanMessage = cleanMessage.replace(/^[^a-zA-Z0-9]+/, '').replace(/[^a-zA-Z0-9]+$/, '');
            
            if (cleanMessage.length <= 3) {
              title = cleanMessage || 'Completed Questionnaire';
            } else {
              let t = cleanMessage.substring(0, 25);
              const lastSpace = t.lastIndexOf(' ');
              if (lastSpace > 10) {
                t = t.substring(0, lastSpace);
              }
              t = t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
              if (t.length < cleanMessage.length) {
                t += '...';
              }
              title = t || 'Completed Questionnaire';
            }
          }

          // Generate mitigation statement using Claude with RAG
          const mitigationStatement = await claudeService.generateMitigationStatement(formattedResponses, offenseType);

          console.log('💾 [DEBUG] Storing completed questionnaire in database');

          // Store the completed questionnaire in the database
          try {
            // Create order with questionnaire response
            const order = await prisma.order.create({
              data: {
                userId: userId,
                offenseType: offenseType,
                status: 'COMPLETED',
                amount: 49.99, // TODO: Get actual pricing
                completionMessage: responseText, // Store the actual completion message
                responses: {
                  create: {
                    userId: userId,
                    sessionId: currentSessionId,
                    // When a conversation is completed we set a generic title so the UI shows
                    // the 'Starting consultation...' placeholder rather than a generated title
                    title: title,
                    messages: JSON.stringify(conversationWithCurrentMessage),
                    offenseType: offenseType
                  }
                }
              }
            });

            // Create document with mitigation statement
            await prisma.document.create({
              data: {
                orderId: order.id,
                userId: userId,
                content: mitigationStatement,
                status: 'PENDING_REVIEW'
              }
            });

            console.log('💾 [DEBUG] Successfully stored order and document:', {
              orderId: order.id,
              responseCount: formattedResponses.length
            });

            // Delete any existing draft conversations for this completed questionnaire
            try {
              const deletedDrafts = await prisma.draftConversation.deleteMany({
                where: {
                  userId: userId,
                  sessionId: currentSessionId
                }
              });
              if (deletedDrafts.count > 0) {
                console.log('🗑️ [DEBUG] Deleted draft conversations after completion:', {
                  sessionId: currentSessionId,
                  deletedCount: deletedDrafts.count
                });
              }
            } catch (draftDeleteError) {
              console.error('❌ [DEBUG] Failed to delete draft conversations:', draftDeleteError);
              // Don't fail the request if draft deletion fails
            }

          } catch (dbError) {
            console.error('❌ [DEBUG] Failed to store questionnaire in database:', dbError);
            // Continue with response even if database storage fails
          }

            responseText = "Thank you for providing all that information. I've generated your mitigation statement and submitted it for review by our qualified legal team. You'll receive an email notification once it's been reviewed and approved for delivery. You can check the status in your Documents section. Click <a href='/documents'>here</a> to view your documents.";
          isFinal = true;
        } catch (error) {
          console.error('Error generating mitigation statement:', error);

          // Still store the questionnaire responses even if Claude fails
          try {
            console.log('💾 [DEBUG] Storing questionnaire responses despite Claude error');

            // Extract offense type from the second response (index 1)
            const offenseType = actualResponses[1] || 'general';

            // Generate title from the second user message
            let title = 'Completed Questionnaire';
            if (actualResponses.length >= 2) {
              const secondUserMessage = actualResponses[1];
              let cleanMessage = secondUserMessage.trim();
              cleanMessage = cleanMessage.replace(/^[^a-zA-Z0-9]+/, '').replace(/[^a-zA-Z0-9]+$/, '');
              
              if (cleanMessage.length <= 3) {
                title = cleanMessage || 'Completed Questionnaire';
              } else {
                let t = cleanMessage.substring(0, 25);
                const lastSpace = t.lastIndexOf(' ');
                if (lastSpace > 10) {
                  t = t.substring(0, lastSpace);
                }
                t = t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
                if (t.length < cleanMessage.length) {
                  t += '...';
                }
                title = t || 'Completed Questionnaire';
              }
            }

            const order = await prisma.order.create({
              data: {
                userId: userId,
                offenseType: offenseType,
                status: 'PENDING', // Mark as pending since statement generation failed
                amount: 49.99,
                completionMessage: responseText, // Store the actual completion message
                responses: {
                  create: {
                    userId: userId,
                    sessionId: currentSessionId,
                    title: title,
                    messages: JSON.stringify(conversationWithCurrentMessage),
                    offenseType: offenseType
                  }
                }
              }
            });

            console.log('💾 [DEBUG] Stored questionnaire with pending status:', {
              orderId: order.id,
              responseCount: formattedResponses.length
            });

            // Delete any existing draft conversations for this completed questionnaire
            try {
              const deletedDrafts = await prisma.draftConversation.deleteMany({
                where: {
                  userId: userId,
                  sessionId: currentSessionId
                }
              });
              if (deletedDrafts.count > 0) {
                console.log('🗑️ [DEBUG] Deleted draft conversations after completion (error path):', {
                  sessionId: currentSessionId,
                  deletedCount: deletedDrafts.count
                });
              }
            } catch (draftDeleteError) {
              console.error('❌ [DEBUG] Failed to delete draft conversations (error path):', draftDeleteError);
              // Don't fail the request if draft deletion fails
            }

          } catch (dbError) {
            console.error('❌ [DEBUG] Failed to store questionnaire in database:', dbError);
          }

          responseText = "Thank you for providing all that information. I encountered an issue generating your statement, but your responses have been saved. Our team will review your case and generate the statement manually. You'll be notified once it's ready.";
          isFinal = true;
        }
      } else {
        // Handle different states
        if (state === "initial") {
          responseText = "Hi, welcome to your consultation. This should take about 15 minutes to complete as I need important information. Are you ready to start?";
        } else if (state === "not_ready") {
          responseText = "No problem. Come back when you are ready.";
        } else if (state === "questions_start") {
          responseText = "Awesome, let's go. " + (questions[0] || "Let's get started!");
        } else if (state === "questions_continue") {
          responseText = "Thank you for sharing that with me. " + (questions[0] || "Thank you for all that information.");
        } else {
          responseText = "Thank you for that information. Could you tell me more about your situation?";
        }
      }

      // Add assistant response to conversation and store it in Redis
      const assistantMessage = { role: 'assistant', content: responseText };
      const updatedConversation = [...cleanedConversation, assistantMessage];
      await redisHelpers.setConversation(userId, currentSessionId, updatedConversation);

      // Auto-save to database if conditions met
      await autoSaveConversation(userId, currentSessionId, updatedConversation);

      // Invalidate conversations cache since we may have updated drafts
      await redisHelpers.invalidateConversationsCache(userId);

      // If this conversation is final (completed questionnaire), remove any draft and in-memory session
      if (isFinal) {
        try {
          // Remove draft conversation from DB (if exists)
          await prisma.draftConversation.deleteMany({
            where: {
              userId,
              sessionId: currentSessionId
            }
          });
          console.log('🗑️ Deleted draftConversation for', { userId, sessionId: currentSessionId });
        } catch (delErr) {
          console.error('❌ Error deleting draftConversation after completion:', delErr);
        }

        try {
          // Remove Redis session so it's not listed as an active draft/session
          await redisHelpers.deleteConversation(userId, currentSessionId);
          console.log('🗑️ Deleted Redis session for', { userId, sessionId: currentSessionId });
        } catch (redisDelErr) {
          console.error('❌ Error deleting Redis session after completion:', redisDelErr);
        }

        // Invalidate cache again after completion changes
        await redisHelpers.invalidateConversationsCache(userId);
      }

      console.log('💬 [DEBUG] Sending response:', {
        responseText: responseText.substring(0, 200) + (responseText.length > 200 ? '...' : ''),
        sessionId: currentSessionId,
        isFinal,
        updatedConversationLength: updatedConversation.length
      })

      res.json({
        response: responseText,
        sessionId: currentSessionId,
        isFinal: isFinal
      });

    } catch (error) {
      console.error('Chat error:', error);
      res.status(500).json({ error: 'Something went wrong!' });
    }
  },

  // Add a new function to initialize the chat session
  initializeChat: async (req, res) => {
    try {
      const userId = req.user.userId;
      const sessionId = uuidv4();

      // Initialize empty conversation in Redis
      await redisHelpers.setConversation(userId, sessionId, []);
      res.status(200).json({ sessionId });
    } catch (error) {
      console.error('Error initializing chat session:', error);
      res.status(500).json({ error: 'Failed to initialize chat session' });
    }
  },

  // Get all conversations for the authenticated user
  getConversations: async (req, res) => {
    try {
      const userId = req.user.userId;

      // Check cache first
      const cachedConversations = await redisHelpers.getCachedConversations(userId);
      if (cachedConversations) {
        console.log('📋 [CACHE] Returning cached conversations for user:', userId);
        return res.json({ conversations: cachedConversations });
      }

      console.log('📋 [DB] Fetching conversations from database for user:', userId);

      // Get Redis conversations
      const redisConversations = await redisHelpers.getAllUserConversations(userId);
      const inMemoryConversations = Object.entries(redisConversations).map(([sessionId, messages]) => {
        const userMessages = messages.filter(msg => msg.role === 'user');
        let title = 'Starting consultation...';
        if (userMessages.length >= 1 && userMessages[0].content) {
          title = generateTitleFromMessage(userMessages[0].content);
        }

        // Get the last message timestamp (use current time as fallback)
        const lastMessage = messages[messages.length - 1];
        const lastMessageTime = lastMessage ? new Date().toISOString() : new Date().toISOString();

        return {
          id: sessionId,
          sessionId,
          title,
          messageCount: messages.length,
          lastMessageTime,
          isCompleted: messages.some(msg => msg.role === 'assistant' && msg.content.includes('Thank you for providing all that information')),
          type: 'session'
        };
      });

      // Get database orders (completed questionnaires)
      const dbOrders = await prisma.order.findMany({
        where: {
          userId,
          deletedAt: null // Only get non-deleted orders
        },
        include: {
          responses: true,
          document: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      const databaseConversations = dbOrders.map(order => {
        // Get the stored response (if any)
        const firstResponse = order.responses[0];
        let title = firstResponse ? firstResponse.title : `${order.offenseType} Case`;

        // Parse messages to get an accurate message count (stored as JSON)
        let messageCount = 0;
        try {
          if (firstResponse && firstResponse.messages) {
            const msgs = JSON.parse(firstResponse.messages);
            messageCount = Array.isArray(msgs) ? msgs.length : 0;
          }
        } catch (e) {
          messageCount = order.responses.length * 2; // fallback approximation
        }

        return {
          id: order.id, // Use database ID
          sessionId: order.id, // Also set sessionId for frontend compatibility
          title,
          messageCount,
          lastMessageTime: order.createdAt.toISOString(),
          isCompleted: true, // Database orders are always completed
          type: 'order', // Mark as database order
          offenseType: order.offenseType,
          status: order.status
        };
      });

      // Get draft conversations from database
      const dbDrafts = await prisma.draftConversation.findMany({
        where: {
          userId,
          deletedAt: null // Only get non-deleted drafts
        },
        orderBy: {
          updatedAt: 'desc'
        }
      });

      const draftConversations = dbDrafts.map(draft => {
        const messages = JSON.parse(draft.messages || '[]');
        return {
          id: draft.id,
          sessionId: draft.sessionId,
          title: draft.title,
          messageCount: messages.length,
          lastMessageTime: draft.updatedAt.toISOString(),
          isCompleted: false, // Drafts are not completed
          type: 'draft', // Mark as draft conversation
          offenseType: draft.offenseType
        };
      });

      // Combine all conversations and deduplicate by sessionId
      // Priority: completed orders > drafts > redis sessions
      const conversationMap = new Map();

      // Add Redis conversations (lowest priority)
      inMemoryConversations.forEach(conv => {
        conversationMap.set(conv.sessionId, conv);
      });

      // Add drafts (medium priority, will override Redis)
      draftConversations.forEach(conv => {
        conversationMap.set(conv.sessionId, conv);
      });

      // Add completed orders (highest priority, will override others)
      databaseConversations.forEach(conv => {
        conversationMap.set(conv.sessionId, conv);
      });

      const allConversations = Array.from(conversationMap.values());

      // Sort by last message time (most recent first)
      allConversations.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));

      // Cache the result for 30 seconds
      await redisHelpers.setCachedConversations(userId, allConversations);

      res.json({ conversations: allConversations });
    } catch (error) {
      console.error('Error fetching conversations:', error);
      res.status(500).json({ error: 'Failed to fetch conversations' });
    }
  },

  // Get a specific conversation by sessionId (handles both sessions and orders)
  getConversation: async (req, res) => {
    try {
      const userId = req.user.userId;
      const { sessionId } = req.params;

      console.log('📖 [DEBUG] Fetching conversation:', { userId, sessionId })

      // First, try to get Redis conversation
      const messages = await redisHelpers.getConversation(userId, sessionId);
      if (messages) {
        console.log('📖 [DEBUG] Retrieved Redis conversation:', {
          sessionId,
          messageCount: messages.length
        })
        return res.json({ messages });
      }

      // If not found in memory, try to get database order responses
      try {
        const order = await prisma.order.findFirst({
          where: {
            id: sessionId,
            userId,
            deletedAt: null
          },
          include: {
            responses: {
              orderBy: {
                createdAt: 'asc'
              }
            }
          }
        });

        if (order) {
          // Parse the stored messages
          const messages = JSON.parse(order.responses[0].messages);

          console.log('📖 [DEBUG] Retrieved database conversation:', {
            orderId: sessionId,
            messageCount: messages.length
          });

          return res.json({ messages });
        }

        // If not an order, try to get draft conversation
        const draft = await prisma.draftConversation.findFirst({
          where: {
            sessionId,
            userId,
            deletedAt: null
          }
        });

        if (draft) {
          const messages = JSON.parse(draft.messages);
          console.log('📖 [DEBUG] Retrieved draft conversation:', {
            draftId: draft.id,
            sessionId,
            messageCount: messages.length
          });
          return res.json({ messages });
        }
      } catch (dbError) {
        console.log('📖 [DEBUG] Database lookup failed:', dbError.message);
      }

      // If neither found
      console.log('📖 [DEBUG] Conversation not found')
      return res.status(404).json({ error: 'Conversation not found' });

    } catch (error) {
      console.error('❌ [DEBUG] Error fetching conversation:', error);
      res.status(500).json({ error: 'Failed to fetch conversation' });
    }
  },

  // Soft delete a conversation (handles both sessions and orders)
  deleteConversation: async (req, res) => {
    try {
      const userId = req.user.userId;
      const { sessionId } = req.params;

      console.log('🗑️ [DEBUG] Soft deleting conversation:', { userId, sessionId });

      // Invalidate conversations cache since we're modifying the list
      await redisHelpers.invalidateConversationsCache(userId);

      // First, try to delete as Redis session
      const deletedFromRedis = await redisHelpers.deleteConversation(userId, sessionId);
      if (deletedFromRedis) {
        console.log('🗑️ [DEBUG] Permanently deleted session from Redis');

        // Also delete any corresponding draft with the same sessionId
        try {
          const draft = await prisma.draftConversation.findFirst({
            where: {
              sessionId,
              userId,
              deletedAt: null
            }
          });

          if (draft) {
            await prisma.draftConversation.update({
              where: { id: draft.id },
              data: { deletedAt: new Date() }
            });
            console.log('🗑️ [DEBUG] Also soft deleted corresponding draft from database:', sessionId);
          }
        } catch (draftError) {
          console.log('🗑️ [DEBUG] Could not delete corresponding draft:', draftError.message);
        }

        return res.json({ success: true, type: 'session' });
      }

      // If not found in memory, try to find and soft delete as database order
      try {
        const order = await prisma.order.findFirst({
          where: {
            id: sessionId,
            userId,
            deletedAt: null
          }
        });

        if (order) {
          // Soft delete the order
          await prisma.order.update({
            where: { id: sessionId },
            data: { deletedAt: new Date() }
          });

          console.log('🗑️ [DEBUG] Soft deleted order from database:', sessionId);
          return res.json({ success: true, type: 'order' });
        }

        // If not an order, try to delete as draft conversation
        const draft = await prisma.draftConversation.findFirst({
          where: {
            sessionId,
            userId,
            deletedAt: null
          }
        });

        if (draft) {
          // Soft delete the draft
          await prisma.draftConversation.update({
            where: { id: draft.id },
            data: { deletedAt: new Date() }
          });

          console.log('🗑️ [DEBUG] Soft deleted draft conversation from database:', sessionId);
          return res.json({ success: true, type: 'draft' });
        }
      } catch (dbError) {
        console.log('🗑️ [DEBUG] Database lookup failed or order/draft not found:', dbError.message);
      }

      // If neither session nor order found
      console.log('🗑️ [DEBUG] Conversation/order not found for deletion:', sessionId);
      return res.status(404).json({ error: 'Conversation not found' });

    } catch (error) {
      console.error('❌ [DEBUG] Error deleting conversation:', error);
      res.status(500).json({ error: 'Failed to delete conversation' });
    }
  },

  // Soft delete an order by orderId
  deleteOrder: async (req, res) => {
    try {
      const userId = req.user.userId;
      const { orderId } = req.params;

      console.log('🗑️ [DEBUG] Soft deleting order:', { userId, orderId });

      const order = await prisma.order.findFirst({
        where: {
          id: orderId,
          userId: userId,
          deletedAt: null // Only delete if not already deleted
        }
      });

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      await prisma.order.update({
        where: { id: orderId },
        data: { deletedAt: new Date() }
      });

      console.log('🗑️ [DEBUG] Successfully soft deleted order:', orderId);
      res.json({ success: true, type: 'order' });

    } catch (error) {
      console.error('❌ [DEBUG] Error deleting order:', error);
      res.status(500).json({ error: 'Failed to delete order' });
    }
  },

  // Save a draft conversation to the database
  saveDraft: async (req, res) => {
    try {
      const userId = req.user.userId;
      const { sessionId, messages, title, offenseType } = req.body;

      console.log('💾 [DEBUG] Saving draft conversation:', { userId, sessionId, messageCount: messages?.length, title });

      if (!sessionId || !messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Invalid request data' });
      }

      // Generate a title from the second user message if not provided
      let draftTitle = title;
      if (!draftTitle && Array.isArray(messages)) {
        const userMessages = messages.filter(msg => msg.role === 'user');
        if (userMessages.length >= 2) {
          // Use the second user message (first substantive response)
          const secondUserMessage = userMessages[1].content;
          // Clean and truncate like in the frontend
          let cleanMessage = secondUserMessage.trim();
          cleanMessage = cleanMessage.replace(/^[^a-zA-Z0-9]+/, '').replace(/[^a-zA-Z0-9]+$/, '');
          
          if (cleanMessage.length <= 3) {
            draftTitle = cleanMessage || 'Draft Conversation';
          } else {
            let titleText = cleanMessage.substring(0, 25);
            const lastSpace = titleText.lastIndexOf(' ');
            if (lastSpace > 10) {
              titleText = titleText.substring(0, lastSpace);
            }
            titleText = titleText.charAt(0).toUpperCase() + titleText.slice(1).toLowerCase();
            if (titleText.length < cleanMessage.length) {
              titleText += '...';
            }
            draftTitle = titleText || 'Draft Conversation';
          }
        } else {
          draftTitle = 'Draft Conversation';
        }
      }

      // Check if draft already exists for this conversation
      const existingDraft = await prisma.draftConversation.findUnique({
        where: {
          userId_sessionId: {
            userId,
            sessionId
          }
        }
      });

      const isUpdate = !!existingDraft;

      // Save or update the draft conversation
      const draft = await prisma.draftConversation.upsert({
        where: {
          userId_sessionId: {
            userId,
            sessionId
          }
        },
        update: {
          title: draftTitle,
          messages: JSON.stringify(messages),
          offenseType: offenseType || null,
          updatedAt: new Date()
        },
        create: {
          userId,
          sessionId,
          title: draftTitle,
          messages: JSON.stringify(messages),
          offenseType: offenseType || null
        }
      });

      // Invalidate conversations cache since we modified drafts
      await redisHelpers.invalidateConversationsCache(userId);

      console.log(`💾 [MANUAL-SAVE] ${isUpdate ? 'Updated' : 'Created'} draft:`, { draftId: draft.id, sessionId });
      res.json({ success: true, draftId: draft.id });

    } catch (error) {
      console.error('❌ [DEBUG] Error saving draft:', error);
      res.status(500).json({ error: 'Failed to save draft' });
    }
  },

  // Admin: Get platform statistics
  getAdminStats: async (req, res) => {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      // Get user statistics
      const totalUsers = await prisma.user.count();

      // Get order statistics
      const totalOrders = await prisma.order.count();

      // Get pending reviews (documents with PENDING_REVIEW status)
      const pendingReviews = await prisma.document.count({
        where: { status: 'PENDING_REVIEW' }
      });

      // Get active conversations (Redis keys)
      let activeConversations = 0;
      try {
        const keys = await redisClient.keys('chat:*:*');
        activeConversations = keys.length;
      } catch (redisError) {
        console.warn('Redis error getting active conversations:', redisError);
        activeConversations = 0;
      }

      res.json({
        totalUsers,
        totalOrders,
        pendingReviews,
        activeConversations
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      res.status(500).json({ error: 'Failed to fetch statistics' });
    }
  }
};

module.exports = chatController;

// Start periodic auto-save for all active conversations
setInterval(async () => {
  try {
    console.log('⏰ [AUTO-SAVE] Starting periodic save of active conversations...');

    // Get all Redis keys matching chat pattern
    const keys = await redisClient.keys('chat:*:*');

    for (const key of keys) {
      const [, userId, sessionId] = key.split(':');
      const messages = await redisHelpers.getConversation(userId, sessionId);

      if (messages && messages.length > 0) {
        await autoSaveConversation(userId, sessionId, messages, false);
      }
    }

    console.log('⏰ [AUTO-SAVE] Completed periodic save');
  } catch (error) {
    console.error('❌ Periodic auto-save error:', error);
  }
}, AUTO_SAVE_TIME_INTERVAL);

// Graceful shutdown handling
process.on('SIGTERM', async () => {
  console.log('🛑 Received SIGTERM, saving all conversations before shutdown...');

  try {
    const keys = await redisClient.keys('chat:*:*');

    for (const key of keys) {
      const [, userId, sessionId] = key.split(':');
      const messages = await redisHelpers.getConversation(userId, sessionId);

      if (messages && messages.length > 0) {
        await autoSaveConversation(userId, sessionId, messages, true);
      }
    }

    console.log('✅ All conversations saved before shutdown');
  } catch (error) {
    console.error('❌ Error saving conversations on shutdown:', error);
  }

  await redisClient.quit();
  process.exit(0);
});