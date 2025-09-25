const { v4: uuidv4 } = require('uuid');
const claudeService = require('../services/claudeService');

// In-memory conversation storage (replace with Redis/database in production)
const conversationSessions = {};

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
  } else if (userMessages.length === 1) {
    return isPositiveResponse(userMessages[0]) ? "questions_start" : "not_ready";
  } else if (userMessages.length === 2) {
    // Handle the case where user said "no" first, then came back with "yes"
    if (!isPositiveResponse(userMessages[0]) && isPositiveResponse(userMessages[1])) {
      return "questions_start";
    } else {
      return "questions_continue";
    }
  } else {
    return "questions_continue";
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
    // Get user messages and skip readiness response(s)
    const userMessages = conversation
      .filter(msg => msg.role === 'user')
      .map(msg => msg.content);

    // Determine how many messages to skip based on the conversation pattern
    let skipCount = 1; // Default: skip just the initial "yes"

    // If user said "no" first, then "yes", skip both
    if (userMessages.length >= 2 &&
        !isPositiveResponse(userMessages[0]) &&
        isPositiveResponse(userMessages[1])) {
      skipCount = 2;
    }

    const actualResponses = userMessages.slice(skipCount);

    // Check if last answer is too short
    if (actualResponses.length > 0 && actualResponses[actualResponses.length - 1].trim().length < 2) {
      return ["Could you provide a bit more detail? Even a sentence or two would be helpful."];
    }

    // Count good answers
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

      // Generate new session ID if not provided
      const currentSessionId = sessionId || uuidv4();

      // Clean up conversation
      const cleanedConversation = conversation.filter(msg =>
        msg && typeof msg === 'object' &&
        msg.role && msg.content && msg.content.trim()
      );

      // Store conversation session
      conversationSessions[currentSessionId] = cleanedConversation;

      // Simple logic flow
      const state = getConversationState(cleanedConversation);
      const questions = generateFollowUpQuestions(cleanedConversation);

      let responseText;
      let isFinal = false;

      // If no more questions, generate the statement
      if (!questions && state === "questions_continue") {
        try {
          // Extract user responses for Claude service
          const userMessages = cleanedConversation
            .filter(msg => msg.role === 'user')
            .map(msg => msg.content);

          // Skip readiness responses to get actual answers
          let skipCount = 1;
          if (userMessages.length >= 2 &&
              !isPositiveResponse(userMessages[0]) &&
              isPositiveResponse(userMessages[1])) {
            skipCount = 2;
          }

          const actualResponses = userMessages.slice(skipCount);

          // Format responses for Claude service
          const formattedResponses = actualResponses.map((answer, index) => ({
            question: structuredQuestions[index] || `Question ${index + 1}`,
            answer: answer
          }));

          // Generate mitigation statement using Claude
          const mitigationStatement = await claudeService.generateMitigationStatement(formattedResponses);

          responseText = `Thank you for providing all that information. I've prepared your mitigation statement:\n\n${mitigationStatement}\n\nOur qualified solicitor will review this before delivery.`;
          isFinal = true;
        } catch (error) {
          console.error('Error generating mitigation statement:', error);
          responseText = "Thank you for providing all that information. I encountered an issue generating your statement. Please contact support.";
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
      const sessionId = uuidv4();
      conversationSessions[sessionId] = [];
      res.status(200).json({ sessionId });
    } catch (error) {
      console.error('Error initializing chat session:', error);
      res.status(500).json({ error: 'Failed to initialize chat session' });
    }
  }
};

module.exports = chatController;