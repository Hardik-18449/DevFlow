const { ChatbotKnowledge, ChatbotLog } = require('./chatbot.model');

const INITIAL_KNOWLEDGE_BASE = [
  {
    topic: 'What is DevFlow',
    keywords: ['what is devflow', 'overview', 'about devflow', 'platform', 'purpose', 'what does it do'],
    response: `DevFlow is an enterprise-grade multi-tenant project management and real-time developer collaboration SaaS.

Key platform features:
• Drag-and-Drop Kanban Boards with live status tracking
• WebSocket Live Syncing powered by Socket.IO
• Dual-Level Role-Based Access Control (RBAC)
• Multi-Tenant Organization Workspace Isolation
• Sprint Velocity Analytics powered by Recharts
• Dark & Light Theme System`,
    actionText: 'Try 1-Click Demo',
    actionHref: '#demo',
  },
  {
    topic: 'Multi-Tenant Isolation',
    keywords: ['multi-tenant', 'multi tenant', 'tenant', 'organization', 'isolation'],
    response: `Multi-Tenant Workspace Isolation in DevFlow ensures data security and team segregation:

• Each organization operates in a dedicated, isolated workspace.
• User rosters, project boards, tasks, and audit logs are scoped strictly to the active organization.
• Users can belong to multiple organizations and switch workspaces seamlessly from the top navigation.`,
  },
  {
    topic: 'Roles and Permissions',
    keywords: ['role', 'permission', 'rbac', 'owner', 'admin', 'access control', 'security'],
    response: `DevFlow features a Dual-Level RBAC System for enterprise governance:

Organization-Level Roles:
• Owner: Full workspace administration, billing and member invitations.
• Admin: Organization-wide project management and team administration.
• Member: Standard team participant.

Project-Level Roles:
• Project Manager: Project oversight and task assignments.
• Developer: Task creation, status updates and code discussions.
• Viewer: Read-only oversight access.`,
  },
  {
    topic: '1-Click Demo Credentials',
    keywords: ['demo', '1-click', 'try', 'test', 'login', 'credentials'],
    response: `DevFlow features an Instant 1-Click Demo Mode.

You can explore full functionality right now without filling out forms:
• Owner: owner@devflow.com
• Admin: admin@devflow.com
• Lead Dev (Rahul): rahul@devflow.com
• UI/UX Specialist (Priya): priya@devflow.com

Click any role card on the homepage to log in instantly with pre-seeded workspace data.`,
    actionText: 'Go to 1-Click Demo',
    actionHref: '#demo',
  },
  {
    topic: 'Technology Stack',
    keywords: ['tech', 'stack', 'technology', 'react', 'node', 'mongodb', 'express', 'code'],
    response: `DevFlow is built on a high-performance web architecture:

Frontend:
• React 18 + Vite
• Redux Toolkit & RTK Query
• Tailwind CSS + Custom Dark/Light Tokens
• @dnd-kit (Fluid Drag & Drop)
• Socket.IO Client & Recharts

Backend & Database:
• Node.js + Express.js
• MongoDB + Mongoose ORM
• Zod Validation Middleware
• JWT Authentication & Bcryptjs
• Socket.IO Real-time Engine
• Jest + Supertest Automated Tests`,
  },
  {
    topic: 'Developer Attribution',
    keywords: ['who developed', 'who built', 'who created', 'author', 'creator', 'developer', 'hardik', 'who designed'],
    response: `DevFlow was designed and engineered by Hardik Gurjar.

Built as an enterprise-grade demonstration of modern full-stack web application architecture, security hardening, and real-time collaboration.`,
  },
  {
    topic: 'Chatbot Identity',
    keywords: ['who are you', 'what are you', 'who are u', 'your identity', 'what is your name', 'who created you'],
    response: `I am the DevFlow AI Assistant, an interactive product guide built specifically for the DevFlow SaaS Platform.

I can help answer your questions about DevFlow's features, architecture, RBAC roles, multi-tenant isolation, and technology stack.`,
  },
  {
    topic: 'Kanban Task Board',
    keywords: ['kanban', 'board', 'tasks', 'dnd', 'drag'],
    response: `The DevFlow Kanban Engine enables task management:

• Drag & drop tasks across 5 status stages: Backlog, Todo, In Progress, In Review, and Done.
• Categorize tasks by priority: Low, Medium, High, Urgent.
• Filter by status, assignees, or text queries.
• Changes sync instantly to all online team members via WebSockets.`,
  },
  {
    topic: 'Vercel Deployment',
    keywords: ['deploy', 'deployment', 'vercel', 'hosting', 'host'],
    response: `DevFlow is pre-configured for Vercel serverless deployment:

• vercel.json handles both static React frontend distribution and Express serverless API routes.
• Import Hardik-18449/DevFlow on Vercel, set MONGODB_URI and JWT_ACCESS_SECRET, and deploy.`,
  },
];

const GREETING_KEYWORDS = ['hi', 'hii', 'hiii', 'hello', 'hey', 'heyy', 'greetings', 'hola', 'good morning', 'good afternoon', 'good evening', 'sup', 'yo'];
const THANKS_KEYWORDS = ['thank you', 'thanks', 'thankyou', 'thx', 'tysm', 'thanks a lot', 'thank u', 'appreciate it', 'many thanks'];
const ACK_KEYWORDS = ['okay', 'ok', 'okayy', 'alright', 'cool', 'got it', 'sure', 'fine', 'perfect', 'awesome', 'great'];
const CONFIDENTIAL_KEYWORDS = ['secret', 'api_key', 'apikey', 'jwt_secret', 'mongo_uri', 'database_uri', 'connection string', 'private key', 'env file', 'server password', 'vulnerability', 'exploit', 'token secret', 'smtp_pass', 'credentials password'];

async function seedKnowledgeBase() {
  const count = await ChatbotKnowledge.countDocuments();
  if (count === 0) {
    await ChatbotKnowledge.insertMany(INITIAL_KNOWLEDGE_BASE);
  }
}

async function processQuery(userText, ipAddress = '') {
  await seedKnowledgeBase();

  const query = userText.toLowerCase().trim();

  // 1. Confidentiality Check
  if (CONFIDENTIAL_KEYWORDS.some((kw) => query.includes(kw))) {
    const log = await ChatbotLog.create({
      userQuery: userText,
      isAnswered: true,
      ipAddress,
    });
    return {
      response: 'Security Notice: Sorry, I cannot share any confidential information, database keys, environment secrets, or private system credentials.',
      logId: log._id,
      knowledgeId: null,
    };
  }

  // 2. Greeting Check
  if (GREETING_KEYWORDS.some((kw) => query === kw || query.startsWith(kw + ' '))) {
    const log = await ChatbotLog.create({
      userQuery: userText,
      matchedTopic: 'Greeting',
      isAnswered: true,
      ipAddress,
    });
    return {
      response: `Hello! Welcome to DevFlow. How can I help you explore our enterprise multi-tenant developer workspace today?

You can ask me about:
• Platform Features & Drag-and-Drop Kanban
• Multi-Tenant Organization Isolation
• Dual-Level Roles & Permissions (RBAC)
• 1-Click Interactive Demo Modes
• Full Technology Stack & Vercel Deployment`,
      logId: log._id,
      knowledgeId: null,
    };
  }

  // 3. Thanks Check
  if (THANKS_KEYWORDS.some((kw) => query === kw || query.includes(kw))) {
    const log = await ChatbotLog.create({
      userQuery: userText,
      matchedTopic: 'Thanks',
      isAnswered: true,
      ipAddress,
    });
    return {
      response: 'You are welcome! Feel free to ask if you have any other questions about DevFlow.',
      logId: log._id,
      knowledgeId: null,
    };
  }

  // 4. Okay / Acknowledgment Check
  if (ACK_KEYWORDS.some((kw) => query === kw || query === kw + '!' || query.startsWith(kw + ' '))) {
    const log = await ChatbotLog.create({
      userQuery: userText,
      matchedTopic: 'Acknowledgment',
      isAnswered: true,
      ipAddress,
    });
    return {
      response: 'Glad to help! Let me know if you need anything else.',
      logId: log._id,
      knowledgeId: null,
    };
  }

  // 5. In-House Knowledge Engine Matcher (TF-IDF & Keyword Score)
  const knowledgeEntries = await ChatbotKnowledge.find();
  let bestMatch = null;
  let highestScore = 0;

  const queryWords = query.split(/\s+/);

  for (const entry of knowledgeEntries) {
    let score = 0;
    for (const kw of entry.keywords) {
      if (query.includes(kw)) {
        score += 3;
      }
      for (const qWord of queryWords) {
        if (qWord.length > 3 && kw.includes(qWord)) {
          score += 1;
        }
      }
    }

    // Multiply score by confidenceScore for self-learning weight adjustment
    score = score * (entry.confidenceScore || 1.0);

    if (score > highestScore) {
      highestScore = score;
      bestMatch = entry;
    }
  }

  if (bestMatch && highestScore >= 2) {
    bestMatch.queryCount += 1;
    await bestMatch.save();

    const log = await ChatbotLog.create({
      userQuery: userText,
      matchedTopic: bestMatch.topic,
      matchedKnowledgeId: bestMatch._id,
      isAnswered: true,
      ipAddress,
    });

    return {
      response: bestMatch.response,
      actionText: bestMatch.actionText,
      actionHref: bestMatch.actionHref,
      logId: log._id,
      knowledgeId: bestMatch._id,
    };
  }

  // 6. Fallback for Unmatched / Out-of-Scope Queries (Self-Learning Log)
  const log = await ChatbotLog.create({
    userQuery: userText,
    isAnswered: false,
    ipAddress,
  });

  return {
    response: `Sorry, I don't have this information.

I am trained specifically to answer questions about the DevFlow SaaS Platform (Features, Architecture, RBAC, Multi-Tenancy, Tech Stack, 1-Click Demos, and Developer Attribution).

Please select one of the suggested topics below or ask a question related to DevFlow.`,
    logId: log._id,
    knowledgeId: null,
  };
}

async function processFeedback(logId, feedbackType) {
  if (!logId) return;

  const log = await ChatbotLog.findById(logId);
  if (!log) return;

  log.feedback = feedbackType;
  await log.save();

  if (log.matchedKnowledgeId) {
    const knowledge = await ChatbotKnowledge.findById(log.matchedKnowledgeId);
    if (knowledge) {
      if (feedbackType === 'up') {
        knowledge.thumbsUp += 1;
        // Increase confidence weight score over time (Self-Learning)
        knowledge.confidenceScore = Math.min(2.0, knowledge.confidenceScore + 0.05);
      } else if (feedbackType === 'down') {
        knowledge.thumbsDown += 1;
        // Decrease confidence weight score if users rate negatively
        knowledge.confidenceScore = Math.max(0.3, knowledge.confidenceScore - 0.05);
      }
      await knowledge.save();
    }
  }
}

module.exports = {
  processQuery,
  processFeedback,
};
