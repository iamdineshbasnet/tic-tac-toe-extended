const express = require('express')
const { generateAvatars } = require('../controllers/avatar')

const router = express.Router()

router.get('/generate', generateAvatars)

module.exports = router