const express = require('express')
const { getPlayer } = require('../controllers/player')
const { Authenticate } = require('../config/authenticate')

const router = express.Router()

// get player
router.get('/', Authenticate, getPlayer)


module.exports = router