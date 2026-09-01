import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, MessageSquare, ArrowRight, User, Shield, Kanban, Zap, Code } from 'lucide-react';
import { Link } from 'react-router-dom';

const QUICK_QUESTIONS = [
  'What is DevFlow?',
  'How does Multi-Tenant isolation work?',
  'What are the roles & permissions?',
  'How do 1-Click Demos work?',
  'What technology stack is used?',
  'Who developed DevFlow?',
];

const KNOWLEDGE_BASE = [
  {
    keywords: ['what is devflow', 'overview', 'about devflow', 'platform', 'purpose', 'what does it do'],
    response: `DevFlow is an enterprise-grade multi-tenant project management and real-time developer collaboration SaaS.

Key platform features:
• Drag-and-Drop Kanban Boards with live status tracking
• WebSocket Live Syncing powered by Socket.IO
• Dual-Level Role-Based Access Control (RBAC)
• Multi-Tenant Organization Workspace Isolation
• Sprint Velocity Analytics powered by Recharts
• Dark & Light Theme System`,
    action: { text: 'Try 1-Click Demo', href: '#demo' },
  },
  {
    keywords: ['multi-tenant', 'multi tenant', 'tenant', 'organization', 'isolation'],
    response: `Multi-Tenant Workspace Isolation in DevFlow ensures data security and team segregation:

• Each organization operates in a dedicated, isolated workspace.
• User rosters, project boards, tasks, and audit logs are scoped strictly to the active organization.
• Users can belong to multiple organizations and switch workspaces seamlessly from the top navigation.`,
  },
  {
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
    keywords: ['demo', '1-click', 'try', 'test', 'login', 'credentials'],
    response: `DevFlow features an Instant 1-Click Demo Mode.

You can explore full functionality right now without filling out forms:
• Owner: owner@devflow.com
• Admin: admin@devflow.com
• Lead Dev (Rahul): rahul@devflow.com
• UI/UX Specialist (Priya): priya@devflow.com

Click any role card on the homepage to log in instantly with pre-seeded workspace data.`,
    action: { text: 'Go to 1-Click Demo', href: '#demo' },
  },
  {
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
    keywords: ['who', 'developed', 'author', 'creator', 'developer', 'hardik'],
    response: `DevFlow was designed and engineered by Hardik Gurjar.

• GitHub Profile: github.com/Hardik-18449
• Project Repository: github.com/Hardik-18449/DevFlow

Built as an enterprise-grade demonstration of modern full-stack web application architecture, security hardening, and real-time collaboration.`,
  },
  {
    keywords: ['kanban', 'board', 'tasks', 'dnd', 'drag'],
    response: `The DevFlow Kanban Engine enables task management:

• Drag & drop tasks across 5 status stages: Backlog, Todo, In Progress, In Review, and Done.
• Categorize tasks by priority: Low, Medium, High, Urgent.
• Filter by status, assignees, or text queries.
• Changes sync instantly to all online team members via WebSockets.`,
  },
  {
    keywords: ['deploy', 'deployment', 'vercel', 'hosting', 'host'],
    response: `DevFlow is pre-configured for Vercel serverless deployment:

• vercel.json handles both static React frontend distribution and Express serverless API routes.
• Import Hardik-18449/DevFlow on Vercel, set MONGODB_URI and JWT_ACCESS_SECRET, and deploy.`,
  },
];

const GREETING_KEYWORDS = [
  'hi',
  'hii',
  'hiii',
  'hello',
  'hey',
  'heyy',
  'greetings',
  'hola',
  'good morning',
  'good afternoon',
  'good evening',
  'sup',
  'yo',
];

const THANKS_KEYWORDS = [
  'thank you',
  'thanks',
  'thankyou',
  'thx',
  'tysm',
  'thanks a lot',
  'thank u',
  'appreciate it',
  'many thanks',
];

const ACK_KEYWORDS = [
  'okay',
  'ok',
  'okayy',
  'alright',
  'cool',
  'got it',
  'sure',
  'fine',
  'perfect',
  'awesome',
  'great',
];

const CONFIDENTIAL_KEYWORDS = [
  'secret',
  'api_key',
  'apikey',
  'jwt_secret',
  'mongo_uri',
  'database_uri',
  'connection string',
  'private key',
  'env file',
  'server password',
  'vulnerability',
  'exploit',
  'token secret',
  'smtp_pass',
  'credentials password',
];

const findAnswer = (userText) => {
  const query = userText.toLowerCase().trim();

  // 1. Greeting Handler
  if (GREETING_KEYWORDS.some((kw) => query === kw || query.startsWith(kw + ' '))) {
    return {
      response: `Hello! Welcome to DevFlow. How can I help you explore our enterprise multi-tenant developer workspace today?

You can ask me about:
• Platform Features & Drag-and-Drop Kanban
• Multi-Tenant Organization Isolation
• Dual-Level Roles & Permissions (RBAC)
• 1-Click Interactive Demo Modes
• Full Technology Stack & Vercel Deployment`,
    };
  }

  // 2. Thanks / Gratitude Handler
  if (THANKS_KEYWORDS.some((kw) => query === kw || query.includes(kw))) {
    return {
      response: `You are welcome! Feel free to ask if you have any other questions about DevFlow.`,
    };
  }

  // 3. Okay / Acknowledgment Handler
  if (ACK_KEYWORDS.some((kw) => query === kw || query === kw + '!' || query.startsWith(kw + ' '))) {
    return {
      response: `Glad to help! Let me know if you need anything else.`,
    };
  }

  // 4. Confidentiality Protection Guard
  if (CONFIDENTIAL_KEYWORDS.some((kw) => query.includes(kw))) {
    return {
      response: `Security Notice: Sorry, I cannot share any confidential information, database keys, environment secrets, or private system credentials.`,
    };
  }

  // 3. Product Knowledge Lookup
  for (const item of KNOWLEDGE_BASE) {
    if (item.keywords.some((kw) => query.includes(kw))) {
      return item;
    }
  }

  // 4. Fallback for Unknown / Out-of-Scope Questions
  return {
    response: `Sorry, I don't have this information.

I am trained specifically to answer questions about the DevFlow SaaS Platform (Features, Architecture, RBAC, Multi-Tenancy, Tech Stack, 1-Click Demos, and Developer Attribution). 

Please select one of the suggested topics below or ask a question related to DevFlow.`,
  };
};

export const ProductChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: `Hi there! Welcome to DevFlow. I am your interactive product guide.

How can I help you explore our enterprise multi-tenant developer workspace today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  const handleSend = (textToSend) => {
    const query = (textToSend || inputValue).trim();
    if (!query) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const match = findAnswer(query);
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: match.response,
        action: match.action,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 transition-all selection:bg-accent/30 selection:text-white">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-accent text-white font-semibold text-xs shadow-lg hover:bg-accent-hover hover:scale-105 active:scale-95 transition-all cursor-pointer border border-white/20"
          aria-label="Open DevFlow AI Assistant"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400"></span>
          </span>
          <Bot size={18} className="animate-bounce-subtle" />
          <span>Ask DevFlow AI</span>
        </button>
      )}

      {/* Chat Window Container */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[520px] max-h-[85vh] bg-cardBg border border-borderColor rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-fade-in transition-all">
          {/* Header */}
          <div className="p-4 bg-accent text-white flex items-center justify-between shadow-subtle shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white shrink-0">
                <Bot size={22} />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight flex items-center gap-1.5">
                  <span>DevFlow AI Guide</span>
                </h3>
                <p className="text-[11px] text-white/80 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
                  <span>Online • Instant Answers</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
              title="Close chat"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs bg-bgPrimary/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-xl bg-accent/15 border border-accent/30 text-accent flex items-center justify-center shrink-0 mt-0.5">
                    <Bot size={15} />
                  </div>
                )}
                <div
                  className={`max-w-[82%] p-3.5 rounded-2xl leading-relaxed space-y-2 ${msg.sender === 'user'
                    ? 'bg-accent text-white font-medium rounded-tr-none'
                    : 'bg-cardBg border border-borderColor text-textPrimary shadow-subtle rounded-tl-none'
                    }`}
                >
                  <div className="whitespace-pre-line font-normal">{msg.text}</div>
                  {msg.action && (
                    <div className="pt-2 border-t border-borderColor/50">
                      <a
                        href={msg.action.href}
                        onClick={() => setIsOpen(false)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-white font-semibold text-[11px] hover:bg-accent-hover transition-colors"
                      >
                        <span>{msg.action.text}</span>
                        <ArrowRight size={13} />
                      </a>
                    </div>
                  )}
                  <span
                    className={`block text-[10px] text-right mt-1 opacity-70 ${msg.sender === 'user' ? 'text-white' : 'text-textSecondary'
                      }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-xl bg-bgSecondary border border-borderColor text-textSecondary flex items-center justify-center shrink-0 mt-0.5">
                    <User size={15} />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-xl bg-accent/15 border border-accent/30 text-accent flex items-center justify-center shrink-0">
                  <Bot size={15} />
                </div>
                <div className="p-3.5 rounded-2xl rounded-tl-none bg-cardBg border border-borderColor text-textSecondary flex items-center gap-1.5 shadow-subtle">
                  <span className="w-2 h-2 rounded-full bg-accent animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-accent animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 rounded-full bg-accent animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Quick Questions Chips */}
          <div className="p-2.5 bg-cardBg border-t border-borderColor overflow-x-auto whitespace-nowrap flex gap-1.5 scrollbar-none shrink-0">
            {QUICK_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="px-2.5 py-1 rounded-full bg-bgSecondary hover:bg-accent hover:text-white text-[11px] text-textSecondary font-medium transition-all border border-borderColor shrink-0 cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-cardBg border-t border-borderColor flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              placeholder="Ask about features, RBAC, tech stack..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 px-3.5 py-2 bg-bgSecondary border border-borderColor rounded-xl text-xs text-textPrimary focus:outline-none focus:border-accent transition-colors"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="p-2 rounded-xl bg-accent text-white hover:bg-accent-hover transition-colors disabled:opacity-40 cursor-pointer shrink-0"
              title="Send message"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
