const jwt = require("jsonwebtoken")

const Authenticate = async(req, res, next) =>{
  const authHeader = req.headers['authorization']

  // extract token from authorization header
  const token = authHeader && authHeader.split(' ')[1]

  // throw error if token doesn't exist
  if(!token){
    return res.status(401).json({ status: 'unauthorized', message: 'Authorization failed. No access token'})
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decode)=>{

    if(err){
      return res.status(500).json({ status: 'error', message: err.message})
    }
    req.player = decode
    next()
  })
}

module.exports = {Authenticate}