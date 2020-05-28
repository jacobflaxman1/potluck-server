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

    describe('Post Potluck', () => {
        beforeEach('insert users', () => 
        helpers.seedPotluckTable(
            db,
            testUsers,
            testItems,
            testPotlucks
          )
        )
        it(`Creates a potluck, responding with 200 and the potluck_id`, () => {
            const testUser = testUsers[0]
            const newPotluck = {
                potluck_name: 'test name',
                potluck_items: ['test', 'test1'],
                potluck_people: ['test-1', 'test-2']
            }
            return supertest(app)
                .post('/api/potlucks')
                .set('Authorization', helpers.makeAuthHeader(testUser))
                .send(newPotluck)
                .expect(200)
                .expect(res => {
                    expect(res.body).to.have.property('potluck_id')
                    expect(res.body.admin_user).to.eql(testUser.user_id)
                    expect(res.body.potluck_name).to.eql(newPotluck.potluck_name)
                })
            })
    })
})