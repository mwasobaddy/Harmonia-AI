const { v4: uuidv4 } = require('uuid');
const claudeService = require('../services/claudeService');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// In-memory conversation storage (replace with Redis/database in production)
// Now organized by userId: { userId: { sessionId: conversation } }
const userConversations = {};

// Structured questions from main.py
const structuredQuestions = [
  "I'd like to start by getting to know you a bit better. Could you tell me about your work? I'm interested in your profession, how long you've been qualified, your typical working hours, and what your working pattern is like.",
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

      // Add current message to conversation for completion check
      const conversationWithCurrentMessage = message ? [...cleanedConversation, { role: 'user', content: message }] : cleanedConversation;

      console.log('💬 [DEBUG] Cleaned conversation:', {
        originalLength: conversation?.length || 0,
        cleanedLength: cleanedConversation.length,
        withCurrentMessage: conversationWithCurrentMessage.length
      })

      // Initialize user conversations if not exists
      if (!userConversations[userId]) {
        userConversations[userId] = {};
      }

      // Store conversation session
      userConversations[userId][currentSessionId] = cleanedConversation;

      // Simple logic flow - check completion using conversation with current message
      const state = getConversationState(conversationWithCurrentMessage);
      const questions = generateFollowUpQuestions(conversationWithCurrentMessage);

      let responseText;
      let isFinal = false;

      // If no more questions, generate the statement
      if (questions.length === 0 && state === "questions_continue") {
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
          const formattedResponses = actualResponses.map((answer, index) => ({
            question: structuredQuestions[index] || `Question ${index + 1}`,
            answer: answer
          }));

          // Generate mitigation statement using Claude with RAG
          const mitigationStatement = await claudeService.generateMitigationStatement(formattedResponses, 'general');

          console.log('💾 [DEBUG] Storing completed questionnaire in database');

          // Store the completed questionnaire in the database
          try {
            // Create order with questionnaire responses
            const order = await prisma.order.create({
              data: {
                userId: userId,
                offenseType: 'general', // TODO: Get this from conversation or user input
                status: 'COMPLETED',
                amount: 49.99, // TODO: Get actual pricing
                responses: {
                  create: formattedResponses.map(response => ({
                    question: response.question,
                    answer: response.answer
                  }))
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

          } catch (dbError) {
            console.error('❌ [DEBUG] Failed to store questionnaire in database:', dbError);
            // Continue with response even if database storage fails
          }

          responseText = "Thank you for providing all that information. I've generated your mitigation statement and submitted it for review by our qualified legal team. You'll receive an email notification once it's been reviewed and approved for delivery. You can check the status in your Documents section.";
          isFinal = true;
        } catch (error) {
          console.error('Error generating mitigation statement:', error);

          // Still store the questionnaire responses even if Claude fails
          try {
            console.log('💾 [DEBUG] Storing questionnaire responses despite Claude error');

            const order = await prisma.order.create({
              data: {
                userId: userId,
                offenseType: 'general',
                status: 'PENDING', // Mark as pending since statement generation failed
                amount: 49.99,
                responses: {
                  create: formattedResponses.map(response => ({
                    question: response.question,
                    answer: response.answer
                  }))
                }
              }
            });

            console.log('💾 [DEBUG] Stored questionnaire with pending status:', {
              orderId: order.id,
              responseCount: formattedResponses.length
            });

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

      // Add assistant response to conversation and store it
      const assistantMessage = { role: 'assistant', content: responseText };
      const updatedConversation = [...cleanedConversation, assistantMessage];
      userConversations[userId][currentSessionId] = updatedConversation;

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

      // Initialize user conversations if not exists
      if (!userConversations[userId]) {
        userConversations[userId] = {};
      }

      userConversations[userId][sessionId] = [];
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

      // Initialize user conversations if not exists
      if (!userConversations[userId]) {
        userConversations[userId] = {};
      }

      // Get in-memory conversations
      const inMemoryConversations = Object.entries(userConversations[userId]).map(([sessionId, messages]) => {
        // Get the first user message as title, or use a default
        const firstUserMessage = messages.find(msg => msg.role === 'user');
        const title = firstUserMessage
          ? firstUserMessage.content.substring(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '')
          : 'New Conversation';

        // Get the last message timestamp (use current time as fallback)
        const lastMessage = messages[messages.length - 1];
        const lastMessageTime = lastMessage ? new Date().toISOString() : new Date().toISOString();

        return {
          id: sessionId, // Use sessionId as id for frontend compatibility
          sessionId,
          title,
          messageCount: messages.length,
          lastMessageTime,
          isCompleted: messages.some(msg => msg.role === 'assistant' && msg.content.includes('Thank you for providing all that information')),
          type: 'session' // Mark as in-memory session
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
        // Get the first response as title, or use offense type
        const firstResponse = order.responses[0];
        const title = firstResponse
          ? firstResponse.answer.substring(0, 50) + (firstResponse.answer.length > 50 ? '...' : '')
          : `${order.offenseType} Case`;

        return {
          id: order.id, // Use database ID
          sessionId: order.id, // Also set sessionId for frontend compatibility
          title,
          messageCount: order.responses.length * 2, // Approximate: questions + answers
          lastMessageTime: order.createdAt.toISOString(),
          isCompleted: true, // Database orders are always completed
          type: 'order', // Mark as database order
          offenseType: order.offenseType,
          status: order.status
        };
      });

      // Combine both types of conversations
      const allConversations = [...inMemoryConversations, ...databaseConversations];

      // Sort by last message time (most recent first)
      allConversations.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));

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

      // First, try to get in-memory conversation
      if (userConversations[userId] && userConversations[userId][sessionId]) {
        const messages = userConversations[userId][sessionId];
        console.log('📖 [DEBUG] Retrieved in-memory conversation:', {
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
          // Convert questionnaire responses to chat messages
          const messages = [];

          // Add welcome message
          messages.push({
            role: 'assistant',
            content: "Hi, welcome to your consultation. This should take about 15 minutes to complete as I need important information. Are you ready to start?",
            timestamp: order.createdAt
          });

          // Add user readiness response (assume "yes" for completed orders)
          messages.push({
            role: 'user',
            content: 'Yes',
            timestamp: order.createdAt
          });

          // Add questionnaire Q&A pairs
          order.responses.forEach((response, index) => {
            // Add assistant question
            messages.push({
              role: 'assistant',
              content: response.question,
              timestamp: response.createdAt
            });

            // Add user answer
            messages.push({
              role: 'user',
              content: response.answer,
              timestamp: response.createdAt
            });
          });

          // Add completion message
          messages.push({
            role: 'assistant',
            content: "Thank you for providing all that information. I've generated your mitigation statement and it will be available shortly.",
            timestamp: order.updatedAt
          });

          console.log('📖 [DEBUG] Retrieved database conversation:', {
            orderId: sessionId,
            messageCount: messages.length,
            responsesCount: order.responses.length
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

      // First, try to delete as in-memory session
      if (userConversations[userId] && userConversations[userId][sessionId]) {
        delete userConversations[userId][sessionId];
        console.log('🗑️ [DEBUG] Permanently deleted session from memory');
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
      } catch (dbError) {
        console.log('🗑️ [DEBUG] Database lookup failed or order not found:', dbError.message);
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
  }
};

module.exports = chatController;