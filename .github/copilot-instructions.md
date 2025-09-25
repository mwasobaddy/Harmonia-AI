# Copilot Instructions for Mitigation Chatbot Project

## Project Overview
This is a legal AI service providing automated mitigation statement generation for minor criminal offences, professional regulation cases, and similar scenarios. The system uses Claude AI for natural language processing, Pinecone for retrieval-augmented generation (RAG) with scraped caselaw data, and a web frontend for user interaction.

## Architecture
- **Frontend**: Web application (4-5 pages) with embedded chatbot interface. Options under consideration: Bubble.io for no-code/low-code, or React.js for custom development.
- **Backend**: Claude API integration for statement generation, Pinecone vector database for RAG with JSON-formatted caselaw data.
- **Data Flow**: User selects offence type (dropdown: Driving offences, TV licensing, Professional regulation, Minor criminal offences), completes tailored questionnaire (40-50 questions), submits with payment, Claude processes with RAG context to generate mitigation statement.
- **Authentication**: Implement Google OAuth or similar to minimize personal data storage.
- **Hosting**: Render for backend services, web hosting for frontend.

## Key Patterns
- **Prompt Engineering**: Use detailed, offence-specific prompts with 40-50 structured questions. Prefer form-based input over conversational to optimize Claude token usage and cost.
- **RAG Integration**: Query Pinecone with user responses to retrieve relevant caselaw snippets for inclusion in mitigation statements.
- **Payment Integration**: Third-party payment widget on form submission; process payment before generating statement.
- **Review Workflow**: Human review (Gary) of AI-generated statements before delivery to client.
- **Data Minimization**: Avoid storing personal data beyond what's necessary for delivery; use external auth providers.

## Development Workflows
- **Prompt Testing**: Iterate on Claude prompts by testing outputs against sample inputs; adjust questions for accuracy and completeness.
- **Form Design**: Create dynamic forms that adapt based on selected offence type, collecting comprehensive mitigation factors.
- **Integration Testing**: Validate end-to-end flow from form submission to statement generation, ensuring RAG data enhances output quality.
- **Deployment**: Use Render for backend, ensure frontend scales for potential growth.

## Conventions
- Prioritize accuracy and security: Claude chosen for low hallucination rate.
- Cost Optimization: Favor batch form processing over real-time conversational interactions.
- Legal Compliance: All outputs subject to human review; maintain confidentiality of user data.

## Key Files/Directories
/my-monolith-app
├── .env                  # Environment variables for both client and server
├── .gitignore            # Ignore node_modules, .env, etc.
├── package.json          # Top-level dependencies and scripts
├── /client/              # React frontend
│   ├── /public/
│   │   └── index.html
│   ├── /src/
│   │   ├── /components/      # Reusable UI components
│   │   ├── /context/         # React Context for state management (e.g., AuthContext)
│   │   ├── /hooks/           # Custom React hooks
│   │   ├── /pages/           # Main application pages/views
│   │   ├── /utils/           # Helper functions, API clients, etc.
│   │   │   └── api.js        # Functions for calling the backend API
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── README.md
│
└── /server/              # Express.js backend
    ├── /prisma/          # Prisma directory
    │   ├── schema.prisma   # Defines your data model
    │   └── migrations/
    ├── /src/
    │   ├── /controllers/     # Business logic for routes
    │   │   ├── invoiceController.js
    │   │   └── userController.js
    │   ├── /middleware/      # Express middleware (e.g., auth)
    │   │   └── authMiddleware.js
    │   ├── /routes/          # API endpoints
    │   │   ├── invoiceRoutes.js
    │   │   └── userRoutes.js
    │   ├── /services/        # Dedicated services for external APIs and business logic
    │   │   ├── pineconeService.js  # Functions for Pinecone API interactions
    │   │   └── claudeService.js    # Functions for Claude API interactions
    │   ├── server.js         # Entry point for the Express server
    │   └── prismaClient.js   # A module to export the Prisma client instance
    ├── package.json
    └── README.md