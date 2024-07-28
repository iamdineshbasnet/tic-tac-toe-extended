const { generateRandomUsername } = require("../config/generateRandom")
const player = require("../model/player")
const jwt = require('jsonwebtoken')
const { generateAvatar } = require("./avatar")

const createGuest = async(req, res) =>{
  try {
    const { name } = req.body

    
    const username = generateRandomUsername()

    if(!name){
      return res.status(400).json({ message: 'Invalid Credentails'})
    }

    const avatarUrls = await generateAvatar();
    const randomAvatarUrl = avatarUrls[Math.floor(Math.random() * avatarUrls.length)];
    const guest = new player({ name, username, image: randomAvatarUrl })

    await guest.save()

    // GENERATE ACCESS AND REFRESH TOKEN
    const accessToken = jwt.sign({ id: guest?._id, username: guest?.username }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d'})
    const refreshToken = jwt.sign({ id: guest?._id, username: guest?.username }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d'})

    res.status(201).json({ status: 'success', result: guest, accessToken, refreshToken})

    
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message})
  }
}

module.exports = { createGuest }