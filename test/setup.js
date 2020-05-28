process.env.TZ = 'UTC'
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'my-own-special-jwt-secret'

require('dotenv').config()
const { expect } = require('chai')
const supertest = require('supertest')


global.expect = expect
global.supertest = supertest
