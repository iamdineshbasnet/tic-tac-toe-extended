const express = require('express')
const { getPlayer, updatePlayer, deletePlayer } = require('../controllers/player')
const { Authenticate } = require('../config/authenticate')

const router = express.Router()

// get player
router.get('/', Authenticate, getPlayer)

// update player
router.patch('/', Authenticate, updatePlayer)

// delete player
router.delete('/', Authenticate, deletePlayer)


module.exports = router