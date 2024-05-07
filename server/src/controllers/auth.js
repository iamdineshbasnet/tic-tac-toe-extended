const { generateRandomUsername } = require("../config/randomUsername")
const player = require("../model/player")


const createGuest = async(req, res) =>{
  try {
    const { name } = req.body

    
    const username = generateRandomUsername()

    if(!name){
      return res.status(400).json({ message: 'Invalid Credentails'})
    }
    const guest = new player({ name, username })

    await guest.save()

    res.status(201).json({ status: 'success', result: guest})

    
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message})
  }
}

module.exports = { createGuest }