const Anthropic = require('@anthropic-ai/sdk');
const { Pinecone } = require('@pinecone-database/pinecone');
const { pipeline } = require('@xenova/transformers');

class ClaudeService {
  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY,
    });

    this.pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });

    this.indexName = process.env.PINECONE_INDEX_NAME || 'regulatory-cases';
    this.embeddingModel = null;
  }

  async initialize() {
    try {
      // Initialize Pinecone index
      this.index = this.pinecone.Index(this.indexName);

      // Initialize embedding model (using a simpler approach for Node.js)
      // Note: For production, consider using a dedicated embedding service
      console.log('Claude service initialized');
    } catch (error) {
      console.error('Failed to initialize Claude service:', error);
      throw error;
    }
  }

  // Simple text embedding using basic approach (for MVP)
  // In production, use a proper embedding service
  async getEmbedding(text) {
    // For MVP, using a simple hash-based approach
    // Replace with proper embeddings in production
    const simpleHash = text.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);

    // Return a normalized vector (384 dimensions to match all-MiniLM-L6-v2)
    return Array.from({ length: 384 }, (_, i) =>
      Math.sin(simpleHash + i) * 0.1
    );
  }

  async queryRelevantCases(query, topK = 5) {
    try {
      console.log('🔍 [DEBUG] Pinecone Query:', { query, topK });

      const queryEmbedding = await this.getEmbedding(query);
      console.log('🔍 [DEBUG] Generated embedding for query');

      const queryResponse = await this.index.query({
        vector: queryEmbedding,
        topK: topK,
        includeMetadata: true,
      });

      console.log('🔍 [DEBUG] Pinecone Response:', {
        totalMatches: queryResponse.matches?.length || 0,
        matches: queryResponse.matches?.map(match => ({
          id: match.id,
          score: match.score,
          contentPreview: match.metadata?.content?.substring(0, 100) + '...'
        }))
      });

      return queryResponse.matches.map(match => ({
        content: match.metadata?.content || '',
        score: match.score,
        id: match.id,
      }));
    } catch (error) {
      console.error('❌ [DEBUG] Error querying Pinecone:', error);
      return [];
    }
  }

  async generateMitigationStatement(responses, offenseType = 'general') {
    try {
      // Combine user responses
      const combinedInput = responses
        .map(r => `${r.question}: ${r.answer}`)
        .join('\n\n');

      console.log('🤖 [DEBUG] Claude AI Input - User Responses:', responses);
      console.log('🤖 [DEBUG] Claude AI Input - Combined Input:', combinedInput.substring(0, 500) + (combinedInput.length > 500 ? '...' : ''));

      // Query relevant case law
      const relevantCases = await this.queryRelevantCases(combinedInput);
      const context = relevantCases
        .map(c => c.content)
        .join('\n\n---\n\n');

      console.log('🤖 [DEBUG] Claude AI Input - Context from Pinecone:', context.substring(0, 500) + (context.length > 500 ? '...' : ''));

      // Create the prompt based on the detailed prompt from prompt.txt
      const prompt = this.buildPrompt(combinedInput, context, offenseType);

      console.log('🤖 [DEBUG] Claude AI Prompt being sent:', prompt.substring(0, 1000) + (prompt.length > 1000 ? '...' : ''));

      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        temperature: 0.7,
        system: "You are an outstanding UK lawyer with 30 years legal experience in criminal and regulatory compliance law. You are renowned for helping clients prepare plea and mitigation statements to provide to the court or tribunal panel.",
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const generatedText = response.content[0].text;
      console.log('🤖 [DEBUG] Claude AI Response:', generatedText.substring(0, 1000) + (generatedText.length > 1000 ? '...' : ''));

      return generatedText;
    } catch (error) {
      console.error('❌ [DEBUG] Error generating mitigation statement:', error);
      throw new Error('Failed to generate mitigation statement');
    }
  }

  buildPrompt(combinedInput, context, offenseType) {
    return `
      You are an outstanding UK lawyer with 30 years legal experience in criminal and regulatory compliance law. You are renowned for helping clients prepare plea and mitigation statements or just mitigation statements to provide to the court or tribunal panel, in the hope that the court, regulator or tribunal will be lenient to your clients.
      You are required to write a persuasive and compelling mitigation statement for your client based on their instructions and from your own vast knowledge and experience. The statement should be meticulously structured to present a strong case for a lenient client outcome.              
      The statement must only be prepared using the laws of England and Wales and you must reference any UK caselaw, guidance, guidelines, rules, best practice or other legal principles. You must not include any personal data.                
      You should be specific, clear and detailed, speak plain English and use simple language. You should be authoritative. You must define any acronyms relied on.                
      You should prepare the mitigation statement in the first person, as if you were the client.      
      The client has provided the following information throughout our conversation:

      ${combinedInput}
      
      Using the following relevant case information as guidance, draft a comprehensive and professional mitigation statement;

      ${context}

      IMPORTANT: Even if the client has provided limited information, create a professional mitigation statement. Use the available information and make reasonable assumptions where necessary. The goal is to provide a helpful starting point that the client can then refine.
      IMPORTANT: Create a persuasive and compelling mitigation statement that presents a strong case for leniency. The statement should be meticulously structured, reference relevant UK legal principles where appropriate, and be written in the first person as if the client is speaking directly to the court or tribunal panel.
                
      The statement should:
        1. Be professional and respectful in tone
        2. Address any specific allegations mentioned (or acknowledge that details may be limited)
        3. Include relevant mitigating factors if mentioned, or suggest common ones if not specified
        4. Express appropriate remorse if applicable
        5. Outline potential remedial actions if mentioned, or suggest general ones if not specified
        6. Be concise but comprehensive (approximately 300-500 words)
        7. Include a note that the statement can be customized further based on additional details
           
      Do not include any personal information from the provided cases. Focus on creating a statement that is tailored to the client's specific situation.
        1. Be written in the first person from the client's perspective
        2. Be professional, respectful, and authoritative in tone
        3. Address the specific allegations or charges mentioned
        4. Include all relevant mitigating factors provided by the client
        5. Express genuine remorse and acceptance of responsibility where appropriate
        6. Outline remedial actions taken or planned
        7. Reference relevant UK legal principles, guidelines, or best practices where applicable
        8. Define any acronyms used
        9. Be persuasive and compelling while maintaining professional standards
        10. Present a strong case for leniency based on the client's circumstances
        
      Do not include any personal information from the provided cases. Focus on creating a statement that is tailored to the client's specific situation and maximizes their chances of a lenient outcome.
    `;
  }
}

module.exports = new ClaudeService();