const xss = require('xss')
const Treeize = require('treeize')

const ItemService = {
    getItemsById(db, id) {
        return db.raw(`SELECT a.item_id, a.item_name, a.taken, a.taken_by, a.potluck_id, b.user_name, b.user_id
        FROM items_table a left outer join users_table b ON a.taken_by = b.user_id
        WHERE a.item_id = ${id}`)
    },
    updateItemTaken(db, user_id, id) {

        return db
            .raw(`UPDATE items_table SET taken = NOT taken, taken_by = ${user_id} WHERE item_id = ${id} RETURNING item_id`)
    },
    getUserById(db, id) {
      return db.raw(`SELECT user_name FROM users_table WHERE user_id = ${id}`)
    },
    updateItemName(db, newItemName, id) {
        return db
            .from('items_table')
            .update('item_name', `${newItemName.item_name}`)
            .returning('*')
            .then(rows => rows[0])
    },
}


module.exports = ItemService
