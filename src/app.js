require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV } = require('./config')
const authRouter = require('./auth-router/auth-router')
const potluckRouter = require('./potlucks/potluck-router')
const usersRouter = require('./users/users-router')
const itemRouter = require('./items/item-router')
const app = express()
//require services and authRouter

const morganOption = (NODE_ENV === 'production')  ? 'tiny'
  : 'common';

app.use(morgan(morganOption))
app.use(helmet())
app.use(cors())

// app.use('/routerlocation, router name)
app.use('/api/auth', authRouter)
app.use('/api/potlucks', potluckRouter)
app.use('/api/users', usersRouter)
app.use('/api/items', itemRouter)

app.use(function errorHandler(error, req, res, next) {
    let response
    if (NODE_ENV === 'production') {
      response = { error: 'Server error' }
    } else {
      console.error(error)
      response = { error: error.message, object: error }
    }
    res.status(500).json(response)
  })
  

module.exports = app