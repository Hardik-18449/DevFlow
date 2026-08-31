const express = require('express');
const uploadController = require('./upload.controller');
const authenticate = require('../../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.post('/', uploadController.requestUploadUrl);

module.exports = router;
