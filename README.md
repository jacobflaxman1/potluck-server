# Application

Potluck

## Links
live site: https://y-puce.now.sh/
backend: https://limitless-citadel-27748.herokuapp.com

## Using The API

Currently the API supports GET, POST, DELETE, and PATCH endpoints. 

  - Unprotected Endpoints
    - Register A New User: POST (https://limitless-citadel-27748.herokuapp.com/api/users)
  
  - Protected Endpoints
    - Login: POST (https://limitless-citadel-27748.herokuapp.com/auth/login)
    - Get Potlucks: GET (https://limitless-citadel-27748.herokuapp.com/api/potlucks) 
    - Post a Potluck: POST (https://limitless-citadel-27748.herokuapp.com/potlucks)
    - Delete a potluck: DELETE(https://limitless-citadel-27748.herokuapp.com/potlucks/<potluck_id>)
    

## Screen Shots

![login](https://i.imgur.com/IQzXKvA.png "login")
![register](https://i.imgur.com/sSKbsGd.png "register")
![startCreate](https://i.imgur.com/92EGYOm.png "startCreate")
![addName](https://i.imgur.com/B7BVpXZ.png "addName")
![addItems](https://i.imgur.com/IhrB5O1.png "addItems")
![addPeople](https://i.imgur.com/DlnFZCQ.png "addPeople")
![viewPotluck](https://i.imgur.com/ducawdr.png "viewPotluck")

### Summary

  - Potluck was created to be a simple and easy to use event planning application. Its goal is to provide users with a seamless experience that helps organize people and items. 
  
## Technologies
  - React
  - Node.js
  - JavaScript
  - Postgresql 
  - Mocha, Chai
  
  
## Setting Up The Dev Server

- Clone this repository to your local machine git clone NEW-PROJECTS-URL NEW-PROJECTS-NAME

- cd into the cloned repository

- Make a fresh start of the git history for this project with rm -rf .git && git init

- Install the node dependencies npm install

- Move the example Environment file to .env that will be ignored by git and read by the express server mv example.env .env

- Start the application npm start Start nodemon for the application npm run dev Run the tests npm test

- When your new project is ready for deployment, add a new Heroku application with heroku create. This will make a new git remote called "heroku" and you can then npm run deploy which will push to this remote's master branch.
  
