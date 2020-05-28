const express = require('express')
const ItemService = require('./item-service')
const { requireAuth } = require('../middleware/jwt-auth')
const jsonBodyParser = express.json()
const itemRouter = express.Router()
const path = require('path')


itemRouter
    .route('/:item_id')
    .all(requireAuth)
    .get((req, res, next) => {
        ItemService.getItemsById(req.app.get('db'), req.params.item_id)
        .then(items => {
            res.json(items)
        })
        .catch(next)
    })
itemRouter 
    .route('/:item_id')
    .patch(jsonBodyParser, (req, res, next) => {
        if(typeof(req.body.item_name) === 'string') {
            const { item_name } = req.body
            const itemToUpdate = { item_name }

            ItemService.updateItemName(req.app.get('db'), itemToUpdate, req.params.item_id)
            .then(() => res.status(204).end())
        }
        else {
            //update taken 
            let returnedItem;
            let returnedUser;
            ItemService.updateItemTaken(req.app.get('db'), req.user.user_id, req.params.item_id)
            .then((item) => {
               return ItemService.getItemsById(req.app.get('db'), item.rows[0].item_id)
            })
            .then(item => {
                return res.json(item.rows[0])
            })
            .catch(next)
            //NEED A WAY TO UPDATE TAKEN BY WITH USER ID, THEN RETURN THE USERNAME AND ITEM 
        }
    })


module.exports = itemRouter