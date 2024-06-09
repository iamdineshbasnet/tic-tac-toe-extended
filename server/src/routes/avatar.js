const express = require('express')
const { getAvatar } = require('../controllers/avatar')

const router = express.Router()

router.get('/', getAvatar)

module.exports = router