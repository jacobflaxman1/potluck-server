const express = require('express')

const authRouter = express.Router()
const AuthService = require('../middleware/auth-service')
const jsonBodyparser = express.json()

authRouter
  .post('/login', jsonBodyparser, (req, res, next) => {
    const { user_name, password } = req.body
    const loginUser = { user_name, password }

    for (const [key, value] of Object.entries(loginUser)) {
        if (value === undefined){
            return res.status(400).json({
                error: `Missing '${key}' in request body`
            })}
    }

    AuthService.getUserWithUserName(
        req.app.get('db'),
        loginUser.user_name
    )
        .then(dbUser => {
            if(!dbUser) {
                return res.status(400).json({
                    error: 'Incorrect user_name or password'
                })
            }
            return AuthService.comparePasswords(loginUser.password, dbUser.password)
                .then(compareMatch => {
                    if(!compareMatch) {
                        return res.status(400).json({
                            error: `Incorrect user_name or password`
                        })
                    }
                   const sub = dbUser.user_name
                   const payload = { user_id: dbUser.user_id }
                   res.send({
                       authToken: AuthService.createJwt(sub, payload)
                   })
                })
        })
        .catch(next)
  })

module.exports = authRouter