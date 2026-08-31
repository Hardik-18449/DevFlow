const express = require('express');
const searchController = require('./search.controller');
const authenticate = require('../../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/', searchController.searchAll);

module.exports = router;
