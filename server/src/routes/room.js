const express = require('express')
const { createRoom } = require('../controllers/room')

const router = express.Router()

// creating a room
router.post('/', createRoom)

module.exports = router