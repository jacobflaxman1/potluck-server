const xss = require('xss')
const Treeize = require('treeize')

const PotluckService = {
    getAllPotlucks(db) {
        return db
            .from('potluck_table')
            .select('*')
    },
    getUserById(db, id) {
        return db
            .from('users_table')
            .select('user_name')
            .where('user_id', id)
    },
    getPotlucksByUser(db, id) {
        return db.raw(
            `SELECT potluck_id, potluck_name FROM potluck_table where admin_user = ${id}
            UNION SELECT p.potluck_id, p.potluck_name 
            FROM potluck_users_link as u
            JOIN potluck_table as p
            ON u.potluck_id = p.potluck_id
            WHERE guest_user = ${id};
        ;`)
    },
    getItemsInPotluck(db, id) {
        return db.raw(`SELECT a.item_id, a.item_name, a.taken_by, a.taken, a.potluck_id, b.user_name
        FROM items_table a LEFT OUTER JOIN users_table b on a.taken_by = b.user_id 
		WHERE a.potluck_id = ${id};`)
    },
    getUsersInPotluck(db, id) {
        return db
            .select('p.potluck_id', 'u.user_name')
            .from('potluck_users_table')
            .where('potluck_id', id)
    },
    getPotluckById(db, id) {
        return db
            .from('potluck_table')
            .select('*')
            .where('potluck_id', id)
            .first()
    },
    insertPost(db, newPotluck) {
        let potluck_id;
        return db
            .into('potluck_table')
            .insert({potluck_name: newPotluck.potluck_name, admin_user: newPotluck.user_id})
            .returning('potluck_id')
            .then(rows => {
                potluck_id = rows[0]
                let result = newPotluck.potluck_items.map(item => {
                    return ({ item_name: item, potluck_id: potluck_id })
                }) 
                return db
                    .into('items_table')
                    .insert(result)
                    .returning('item_id')
            })
            .then(rows => {
                return db.raw(`INSERT INTO potluck_users_table (potluck_id, item_id, user_id) VALUES (${potluck_id}, ${rows[0]}, ${newPotluck.user_id})`)
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
    },
    deletePotluck(db, id) {
        return db
            .select('*')
            .from('potluck_table')
            .where('potluck_id', id)
            .delete()
            .returning('potluck_id')
    },
    serializePotlucks(potlucks) {
        return potlucks.map(potluck => this.serializePotluck(potluck))
    },
    serializePotluck(potluck) {
        const potluckTree = new Treeize()
    
        const potluckData = potluckTree.grow([ potluck ]).getData()[0]
        return {
           potluck_id: potluckData.potluck_id,
           potluck_name: xss(potluckData.potluck_name),
           date: potluckData.date,
           admin_user: potluckData.admin_user
        }
    }
    
}


const userFields = [
    'usr.id AS user:id',
    'usr.user_name AS user:user_name',
    'usr.nickname AS user:nickname',
    'usr.date AS user:date_modified',
  ]
  


module.exports = PotluckService
