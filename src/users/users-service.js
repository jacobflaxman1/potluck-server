
const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/
const bcrypt = require('bcryptjs')
const xss = require('xss')

const UsersService = {
    validatePassword(password) {
      if (password.length < 8) {
        return 'Password must be longer than 8 characters'
      }
      if (password.length > 72) {
        return 'Password must be less than 72 characters'
      }
      if(password.startsWith(' ') || password.endsWith(' ')) {
          return 'Password cannot start or end with a space'
      }
      if(!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)) {
          return 'Password must contain 1 upper case, lower case, and a special character'
      }
      else {
          return null
      }
    },
    hasUserWithUserName(db, user_name) {
        return db('users_table')
            .where({ user_name })
            .first()
            .then(user => !!user)
    },
    insertUser(db, newUser) {
        return db
          .insert(newUser)
          .into('users_table')
          .returning('*')
          .then(([user]) => user)
    },
    getUsers(db) {
      return db.raw(`SELECT user_name FROM users_table`)
    },
    getGuestsInPotluck(db, id) {
      return db
        .raw(`SELECT user_name FROM potluck_users_link AS p
            JOIN users_table ON p.guest_user = users_table.user_id
            WHERE potluck_id = ${id};`)
      .then(data => {
        return data.rows
      })
    },
    getAdminInPotluck(db, id) {
        return db
        .raw(`SELECT user_name FROM potluck_table AS p
            JOIN users_table ON admin_user = users_table.user_id
            WHERE potluck_id = ${id};`)
      .then(data => {
        return data.rows
      })
    },
    getUserNameById(db, id) {
        return db 
          .raw(`SELECT a.user_name, a.user_id, b.taken_by FROM users_table
                INNER JOIN items_table b ON a.user_id = b.taken_by;`)
    },
    hashPassword(password) {
        return bcrypt.hash(password, 12)
    },
    serializeUser(user) {
        return {
            id: user.user_id,
            full_name: xss(user.user_name),
            nick_name: xss(user.nick_name)
        }
    }
  }
  
  module.exports = UsersService