const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')
const jwt = require('jsonwebtoken')


describe('Potluck Endpoint', function() {
    let db

    const {
        testUsers,
        testPotlucks,
        testItems,
    } = helpers.makePotluckFictures()


    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL
        })
        app.set('db', db)
    })

    after('disconnect from the database', () => db.destroy())

    before('cleanup', () => helpers.cleanTables(db))

    afterEach('cleanup', () => helpers.cleanTables(db))

        describe('Auth endpoints', () => {
            beforeEach('insert users', () => 
            helpers.seedUsers(
                db,
                testUsers,
            )
            )
            const requiredFields = ['user_name', 'password']
            requiredFields.forEach(field => {
                const loginAttemptBody = {
                    user_name: testUsers[0].user_name,
                    password: testUsers[0].password
            }
            
            it(`responds with 400 required error when ${field} is missing`, () => {
                delete loginAttemptBody[field]
                return supertest(app)
                    .post('/api/auth/login')
                    .send(loginAttemptBody)
                    .expect(400, {
                        error: `Missing '${field}' in request body`
                })
            })
        })
            it(`responds with 400 'invalid username or password' when bad username`, () => {
                const userInvalidName = { user_name: 'user-not', password: 'existy' }
                return supertest(app)
                    .post('/api/auth/login')
                    .send(userInvalidName)
                    .expect(400, {
                        error:  'Incorrect user_name or password' 
            })
        })
            it(`responds with 400 'invalid username or password' when bad password`, () => {
                const userInvalidPassword = { user_name: testUsers[0].user_name, password: 'bad' }
                return supertest(app)
                    .post('/api/auth/login')
                    .send(userInvalidPassword)
                    .expect(400, {
                        error: 'Incorrect user_name or password'
            })
        })
            it(`responds 200 and JWT token using secret when valid credentials`, () => {
                const userValidCreds = {
                    user_name: testUsers[0].user_name,
                    password: testUsers[0].password
                }

                const expectedToken = jwt.sign(
                    { user_id: testUsers[0].user_id }, //payload 
                    process.env.JWT_SECRET,
                    { subject: testUsers[0].user_name, algorithm: 'HS256' }
                )
                return supertest(app)
                    .post('/api/auth/login')
                    .send(userValidCreds)
                    .expect(200, { 
                        authToken: expectedToken
            })
        })
    })

    describe('Protected Endpoints', () => {

        beforeEach('insert potlucks', () => 
            helpers.seedPotluckTable(
                db,
                testUsers,
                testItems,
                testPotlucks
            )
        )
        const protectedEndpoints = [
            {
                name: 'GET /api/potlucks/:potluck_id',
                path: '/api/potlucks/1'
            },
            {
                name: 'GET /api/items/:item_id',
                path: '/api/items/:item_id'
            },
            {
                name: 'GET /api/users/names/:user-id',
                path: '/api/users/names/:user_id'
            }
        ]
        protectedEndpoints.forEach(endpoint => {
            describe(endpoint.name, () => {
                it(`Responds with 401 'Missing basic token' When no bearer token`, () => {
                    return supertest(app)
                        .get(endpoint.path)
                        .expect(401, { error: 'Missing bearer token' })
                })
            })
                it(`responds 401 'Unauthorized reqest' when invalid JWT secret`, () => {
                    const validUser = testUsers[0]
                    const invalidSecret = 'nonono'
                    return supertest(app)
                        .get(endpoint.path)
                        .set('Authorization', helpers.makeAuthHeader(validUser, invalidSecret))
                        .expect(401, { error: 'Unauthorized request' })
            })
                it(`responds 401 'Unauthorized request' when invalid sub in payload`, () => {
                    const invalidUser = { user_name: 'nope', id: 1 }
                    return supertest(app)
                        .get(endpoint.path)
                        .set('Authorization', helpers.makeAuthHeader(invalidUser))
                        .expect(401, { error: 'Unauthorized request' })
            })
        })
    })

    describe(`GET /api/potlucks`, () => {
        context(`Given no potlucks`, () => {
            beforeEach(() => db.into('users_table').insert(testUsers))
            it(`responds with 200 and an empty list`, () => {
                return supertest(app)
                    .get('/api/potlucks')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(200, [])
            })
        })
        context(`Given there are potlucks in the database`, () => {
            beforeEach('insert potlucks', () => 
              helpers.seedPotluckTable(
                  db,
                  testUsers,
                  testItems,
                  testPotlucks,
              )
            )
            it(`responds with 200 and a list of all potlucks`, () => {
                const expectedPotlucks = [
                    {
                        potluck_id: 1,
                        potluck_name: 'test-1'
                    }
                ]
                return supertest(app)
                    .get('/api/potlucks')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(200, expectedPotlucks)
            })
            it(`responds with 200 and a potluck`, () => {
                const expectedPotluck = 
                    {
                        potluck_id: 1,
                        potluck_name: 'test-1',
                        admin_user: testUsers[0].user_id
                    }
            
                return supertest(app)
                    .get('/api/potlucks/1')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(200, expectedPotluck)
            })
            it(`responds with 200 and all the items in a potluck`, () => {
                const expectedItems = [
                    {
                        item_id: 2,
                        item_name: 'test 2',
                        taken_by: null,
                        taken: false,
                        potluck_id: testPotlucks[0].potluck_id,
                        user_name: null
                    },
                    {
                        item_id: 1,
                        item_name: 'test',
                        taken_by: null,
                        taken: false,
                        potluck_id: testPotlucks[0].potluck_id,
                        user_name: null
                    }
                ]
                return supertest(app)
                    .get('/api/potlucks/items/1')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(200, expectedItems)
            })
        })
    })
})