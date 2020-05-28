const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

function makeUsersArray() {
    return [
      {
        user_id: 1,
        user_name: 'test-1',
        nick_name: 'TU1',
        password: 'password',
      },
      {
        user_id: 2,
        user_name: 'test-2',
        nick_name: 'TU2',
        password: 'password',

      },
      {
        user_id: 3,
        user_name: 'test-user-3',
        nick_name: 'TU3',
        password: 'password',

      },
      {
        user_id: 4,
        user_name: 'test-user-4',
        nick_name: 'TU4',
        password: 'password',
      },
    ]
  }

function makePotluckArray(users) {
    return [
        {
            potluck_id: 1,
            potluck_name: 'test-1',
            admin_user: users[0].user_id
        },
        {
            potluck_id: 2,
            potluck_name: 'test-2',
            admin_user: users[1].user_id
        }
    ]
}

function makeItemsArray(users, potluck) {
    return [
        {
            item_id: 1,
            item_name: 'test',
            taken: false,
            taken_by: null,
            potluck_id: potluck[0].potluck_id,
            user_name: null
        },
        {
            item_id: 2,
            item_name: 'test 2',
            taken: true,
            taken_by: users[0].user_id,
            potluck_id: potluck[1].potluck_id,
            user_name: users[0].user_name
        }
    ]
}

function makePotluckUsersTableArray(potluck, user, item) {
    return [
        {
            potluck_users_id: 1,
            potluck_id: potluck[0].potluck_id,
            user_id: user[0].user_id,
            item_id: item[0].item_id
        },
        {
            potluck_users_id: 2,
            potluck_id: potluck[1].potluck_id,
            user_id: user[1].user_id,
            item_id: item[1].item_id
        }
    ]
}

function makePotluckUsersLinkArray(users, potluck) {
    return [
        {
            potluck_users_link_id: 1,
            guest_user: users[2].user_id,
            potluck_id: potluck[0].potluck_id
        }
    ]
}

function makePotluckFictures() {
    const testUsers = makeUsersArray()
    const testPotlucks = makePotluckArray(testUsers)
    const testItems = makeItemsArray(testUsers, testPotlucks)
    return { testItems, testPotlucks, testUsers }
}

function cleanTables(db) {
    return db.raw(`TRUNCATE 
            items_table,
            potluck_table,
            users_table,
            potluck_users_table,
            potluck_users_link
            RESTART IDENTITY CASCADE`
    )
}


function seedUsers(db, users) {
    const preppedUsers = users.map(user => ({
        ...user,
        password: bcrypt.hashSync(user.password, 1)
    }))
    return db.into('users_table').insert(preppedUsers)
    .then(() =>
        db.raw(
            `SELECT setval('users_table_user_id_seq', ?)`, [users[users.length -1].user_id]
        )
    )
}

function seedPotluckTable(db, users, items, potlucks) {
    let potluck_id
    const potluck_items = [`${items[0].item_name}`, `${items[1].item_name}`]
    const potluck_people = [`${users[3].user_name}`, `${users[1].user_name}`]
    const potluck_name = potlucks[0].potluck_name
    const newPotluck = { potluck_name, potluck_items, potluck_people }
    return seedUsers(db, users)
        .then(() => 
          db
            .raw(`INSERT INTO potluck_table (potluck_name, admin_user) VALUES ('${newPotluck.potluck_name}', ${users[0].user_id}) returning potluck_id;`)
            .then(data => {
                potluck_id = data.rows[0].potluck_id
                let result = newPotluck.potluck_items.map(item => {
                    return `('${item}', ${potluck_id})`
                }) 
                return db.raw(`INSERT INTO items_table (item_name, potluck_id) VALUES ${result.join(',')} returning item_id`)
            })
            .then(data => {
                return db.raw(`INSERT INTO potluck_users_table (potluck_id, item_id, user_id) VALUES (${potluck_id}, ${data.rows[0].item_id}, ${users[0].user_id})`)
            })
            .then(() => {
                return potluck_id
            })
            .then((potluck_id) => {
                 let result = newPotluck.potluck_people.map(person => {
                     return `SELECT user_id FROM users_table WHERE user_name = '${person}'`
                 })
                    return db.raw( `${result.join(' UNION ')};`) 
            })
            .then((data) => {
                let result = data.rows.map(person => {
                    let guestId = person.user_id
                    return  `INSERT INTO potluck_users_link (guest_user, potluck_id) VALUES (${guestId}, ${potluck_id}) RETURNING potluck_id;`
                })
                        return db.raw(result.join('')) 
             })
            .then(() => {
                return potluck_id
             })
        )
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
    console.log(user)
    const token = jwt.sign({ user_id: user.id }, secret, {
      subject: user.user_name,
      algorithm: 'HS256',
    })
      return `Bearer ${token}`
  }


  module.exports = {
      makeAuthHeader,
      makeItemsArray,
      makePotluckUsersTableArray,
      makePotluckArray,
      makePotluckUsersLinkArray,
      makePotluckFictures,
      makeUsersArray,
      cleanTables,
      seedPotluckTable,
      seedUsers
  }