const express = require('express')
const { createGuest } = require('../controllers/auth')

const router = express.Router()

// guest registration
router.post('/guest-registration', createGuest)


module.exports = router