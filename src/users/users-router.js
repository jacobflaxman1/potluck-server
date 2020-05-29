const express = require('express')
const UsersService = require('./users-service')
const usersRouter = express.Router()
const jsonBodyParser = express.json()
const path = require('path')
const { requireAuth } = require('../middleware/jwt-auth')

usersRouter 
  .route('/names')
  .all(requireAuth)
  .get((req, res, next) => {
    UsersService.getUsers(req.app.get('db'))
    .then(user => {
      res.status(200).json(user)
    })
    .catch(next)
  })
  usersRouter 
  .route('/names/:id')
  .all(requireAuth)
  .get((req, res, next) => {
    let guests;
    let admin;
    UsersService.getGuestsInPotluck(req.app.get('db'), req.params.id)
    .then(guestsData => {
      guests = guestsData
      return UsersService.getAdminInPotluck(req.app.get('db'), req.params.id)
    })
    .then(adminData => {
      return admin = adminData
    })
    .then(user => {
      return res.status(200).json({ guests, admin })
    })
    .catch(next)
  })

usersRouter
  .post('/', jsonBodyParser, (req, res, next) => {

    const { user_name, nick_name, password,  } = req.body

      for(const field of ['user_name', 'nick_name', 'password']) {
          if(!req.body[field])
            return res.status(400).json({ error: `Missing ${field} in request body`})
      }

    const passwordError = UsersService.validatePassword(password)

    if(passwordError) {
        return res.status(400).json({ error: passwordError })
    }
    
    UsersService.hasUserWithUserName(
        req.app.get('db'),
        user_name
    )
    .then(hasUserWithUserName => {
        if(hasUserWithUserName) {
            return res.status(400).json({ error: `Username already taken`})
        }
    })
    return UsersService.hashPassword(password)
    .then(hashedPassword => {
      const newUser = {
      user_name,
      nick_name,
      password: hashedPassword
    }
    return UsersService.insertUser(req.app.get('db'), newUser)
      .then(user => {
        res.status(201)
        .location(path.posix.join(req.originalUrl, `/${user.user_id}`))
        .json(UsersService.serializeUser(user))
      })
  })
  .catch(next) 
})


module.exports = usersRouter