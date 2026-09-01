const mongoose = require('mongoose');

const chatbotKnowledgeSchema = new mongoose.Schema(
  {
    topic: {
      type: String,
      required: true,
      trim: true,
    },
    keywords: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],
    response: {
      type: String,
      required: true,
    },
    actionText: {
      type: String,
      default: null,
    },
    actionHref: {
      type: String,
      default: null,
    },
    confidenceScore: {
      type: Number,
      default: 1.0,
    },
    queryCount: {
      type: Number,
      default: 0,
    },
    thumbsUp: {
      type: Number,
      default: 0,
    },
    thumbsDown: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const chatbotLogSchema = new mongoose.Schema(
  {
    userQuery: {
      type: String,
      required: true,
      trim: true,
    },
    matchedTopic: {
      type: String,
      default: null,
    },
    matchedKnowledgeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChatbotKnowledge',
      default: null,
    },
    isAnswered: {
      type: Boolean,
      default: false,
    },
    feedback: {
      type: String,
      enum: ['up', 'down', null],
      default: null,
    },
    ipAddress: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

const ChatbotKnowledge = mongoose.model('ChatbotKnowledge', chatbotKnowledgeSchema);
const ChatbotLog = mongoose.model('ChatbotLog', chatbotLogSchema);

module.exports = {
  ChatbotKnowledge,
  ChatbotLog,
};
