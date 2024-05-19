const express = require('express')
const { createRoom, joinRoom, getRoomDetails } = require('../controllers/room')
const { Authenticate } = require('../config/authenticate')

const router = express.Router()

// create a room
router.post('/', Authenticate, createRoom)

// join room
router.put('/:id', Authenticate, joinRoom)

// get room details
router.get('/:id', getRoomDetails)

module.exports = router