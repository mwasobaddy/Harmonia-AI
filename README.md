# StreetLegal-AI - AI-Powered Legal Mitigation Platform

## Project Description
StreetLegal-AI is a cutting-edge MERN stack application designed to assist users in generating legal mitigation statements for minor criminal offenses, professional regulation cases, and similar scenarios. Leveraging advanced AI technologies like Claude API and Pinecone RAG, the platform provides an interactive chatbot interface for collecting user responses and generating high-quality mitigation statements. The system ensures professional review and secure handling of user data.

## Key Features
- **Conversational AI Chatbot**: Interactive questionnaire system for gathering mitigation information.
- **AI-Powered Statement Generation**: Uses Claude API with RAG (Retrieval-Augmented Generation).
- **Legal Case Law Integration**: Pinecone vector database with scraped legal precedents.
- **Multiple Offense Categories**: Driving, TV Licensing, Professional Regulation, Minor Criminal.
- **Payment Integration**: Stripe payment processing.
- **Professional Review**: Solicitor-reviewed documents before delivery.
- **Secure Authentication**: Google OAuth integration.

## Architecture
```
Frontend (Next.js) → Backend (Express.js) → Claude API + Pinecone RAG
     ↓                        ↓
PostgreSQL/Prisma ←→ Admin Dashboard
```

## Installation and Setup
Follow the steps outlined in the README to set up the project locally, including database initialization, environment variable configuration, and running the client and server applications.

## Contribution
We welcome contributions to improve the platform. Please follow the guidelines in the README for submitting pull requests and feature enhancements.

## License
This project is licensed under the ISC License.

## 🚀 Features

- **Conversational AI Chatbot**: Interactive questionnaire system for gathering mitigation information
- **AI-Powered Statement Generation**: Uses Claude API with RAG (Retrieval-Augmented Generation)
- **Legal Case Law Integration**: Pinecone vector database with scraped legal precedents
- **Multiple Offense Categories**: Driving, TV Licensing, Professional Regulation, Minor Criminal
- **Payment Integration**: Stripe payment processing
- **Professional Review**: Solicitor-reviewed documents before delivery
- **Secure Authentication**: Google OAuth integration

## 🏗️ Architecture

```
Frontend (Next.js) → Backend (Express.js) → Claude API + Pinecone RAG
     ↓                        ↓
PostgreSQL/Prisma ←→ Admin Dashboard
```

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL database
- Claude API key
- Pinecone account and API key
- Stripe account (for payments)

## 🛠️ Installation

1. **Clone and setup root directory:**
   ```bash
   git clone <repository-url>
   cd mitigation-platform
   npm install
   ```

2. **Setup PostgreSQL database:**
   ```bash
   createdb mitigation_db
   ```

3. **Setup server:**
   ```bash
   cd server
   npm install
   cp .env.example .env
   # Edit .env with your API keys
   npx prisma generate
   npx prisma db push
   ```

4. **Setup client:**
   ```bash
   cd ../client
   npm install
   cp .env.local.example .env.local
   # Edit .env.local with your configuration
   ```

## 🚀 Running the Application

1. **Start the server:**
   ```bash
   cd server
   npm run dev
   ```

2. **Start the client (in a new terminal):**
   ```bash
   cd client
   npm run dev
   ```

3. **Open your browser:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 🔧 Environment Variables

### Server (.env)
```env
DATABASE_URL="postgresql://username:password@localhost:5432/mitigation_db"
CLAUDE_API_KEY=your_claude_api_key
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=regulatory-cases
STRIPE_SECRET_KEY=your_stripe_secret_key
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:3000
```

### Client (.env.local)
```env
API_URL=http://localhost:5000
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

## 📁 Project Structure

```
├── client/                 # Next.js frontend
│   ├── pages/             # Next.js pages
│   ├── components/        # React components
│   ├── lib/              # Utility functions
│   └── styles/           # Global styles
├── server/                # Express.js backend
│   ├── src/
│   │   ├── controllers/  # Route controllers
│   │   ├── routes/       # API routes
│   │   ├── services/     # External API services
│   │   └── prisma/       # Database schema
│   └── prisma/
│       └── schema.prisma # Prisma schema
└── README.md
```

## 🔄 Key Workflows

### 1. User Journey
1. User selects offense type
2. Completes conversational questionnaire
3. Pays via Stripe
4. AI generates mitigation statement
5. Solicitor reviews and approves
6. User receives final document

### 2. AI Generation Process
1. User responses collected via chat
2. Relevant case law retrieved from Pinecone
3. Claude API generates statement with RAG context
4. Statement stored for solicitor review

## 🧪 Testing

```bash
# Run server tests
cd server
npm test

# Run client tests
cd client
npm test
```

## 🚢 Deployment

### Backend (Render)
1. Connect GitHub repository
2. Set environment variables
3. Deploy

### Frontend (Vercel)
1. Connect GitHub repository
2. Set environment variables
3. Deploy

### Database
- Use a cloud PostgreSQL service (e.g., Supabase, Railway, or AWS RDS)

## 🔒 Security

- JWT authentication
- Input validation with Zod
- Rate limiting
- CORS configuration
- Data encryption at rest

## 📊 Monitoring

- Error logging with Winston
- Performance monitoring
- Database query monitoring
- API usage tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📝 License

This project is licensed under the ISC License.

## 📞 Support

For support, please contact the development team or create an issue in the repository.
