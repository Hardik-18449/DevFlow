const { processQuery, processFeedback } = require('./nlpEngine');
const { ChatbotLog, ChatbotKnowledge } = require('./chatbot.model');

const queryChatbot = async (req, res, next) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Query parameter is required',
      });
    }

    const ipAddress = req.ip || req.headers['x-forwarded-for'] || '';
    const result = await processQuery(query, ipAddress);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const submitFeedback = async (req, res, next) => {
  try {
    const { logId, feedback } = req.body;
    if (!logId || !['up', 'down'].includes(feedback)) {
      return res.status(400).json({
        success: false,
        message: 'Valid logId and feedback (up/down) are required',
      });
    }

    await processFeedback(logId, feedback);

    return res.status(200).json({
      success: true,
      message: 'Feedback recorded successfully',
    });
  } catch (error) {
    next(error);
  }
};

const getChatbotStats = async (req, res, next) => {
  try {
    const totalQueries = await ChatbotLog.countDocuments();
    const unansweredCount = await ChatbotLog.countDocuments({ isAnswered: false });
    const knowledgeItems = await ChatbotKnowledge.find().select('topic queryCount thumbsUp thumbsDown confidenceScore');

    return res.status(200).json({
      success: true,
      data: {
        totalQueries,
        unansweredCount,
        knowledgeItems,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  queryChatbot,
  submitFeedback,
  getChatbotStats,
};
