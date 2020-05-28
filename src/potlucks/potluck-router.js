const express = require('express')
const PotluckService = require('./potluck-service')
const { requireAuth } = require('../middleware/jwt-auth')
const jsonBodyParser = express.json()
const potluckRouter = express.Router()
const path = require('path')
// POST POTLUCK
potluckRouter
    .route('/')
    .post(requireAuth, jsonBodyParser, (req, res, next) => {
        const {potluck_name, potluck_items, potluck_people} = req.body
        const newPotluck = { potluck_name, potluck_items, potluck_people }

    for (const [key, value] of Object.entries(newPotluck))
        if (value == null)
         return res.status(400).json({
            error: `Missing '${key}' in request body`
      })

      //VERIFY THAT potluck_people does not have undefined values
      //or create a method that verifies the user name 
      let newPost;

      newPotluck.user_id = req.user.user_id
      PotluckService.insertPost(
          req.app.get('db'),
          newPotluck
      )
      .then(id => {
          PotluckService.getPotluckById(req.app.get('db'), id)
            .then((newPost) => {
                newPost = newPost
                return res.json(newPost)
            })
            .catch(err => console.log(err))
      })
      .catch(next)
    })
// GET ALL POTLUCKS WITH USER ID
potluckRouter
    .route('/')
    .all(requireAuth)
    .get((req, res, next) => {
        PotluckService.getPotlucksByUser(req.app.get('db'), req.user.user_id)
        .then(potlucks => {
            res.json(potlucks.rows)
        })
        .catch(next)
    })

// GET POTLUCK BY ID
potluckRouter
    .route('/:potluck_id')
    //ADD AUTH ROUTER AND CHECK POTLUCKEXISTS
    .all(requireAuth)
    // .all(checkPotluckExists)
    .get((req, res, next) => {
        PotluckService.getPotluckById(req.app.get('db'), req.params.potluck_id)
        .then(potluck => {
            res.json(PotluckService.serializePotluck(potluck)) 
            }
        )
        .catch(next)
    })
    .delete((req, res, next) => {
        PotluckService.deletePotluck(
            req.app.get('db'),
            req.params.potluck_id
        )
        .then((result) => {
            res.status(204).end()
        })
        .catch(next)
    })
// GET ITEMS IN POTLUCK
potluckRouter
    .route('/items/:potluck_id')
    .get((req, res) => {
        PotluckService.getItemsInPotluck(req.app.get('db'), req.params.potluck_id)
        .then(items => {
            res.json(items.rows)
        })
    })

async function checkPotluckExists(req, res, next) {
    try{
        const potluck = await PotluckService.getPotluckById(
            req.app.get('db'),
            req.params.potluck_id
        )
        if(!potluck)
            return res.status(404).json({ error: 'Potluck Does Not Exist' })
    } catch (error) {
        next(error)
    }
}

module.exports = potluckRouter