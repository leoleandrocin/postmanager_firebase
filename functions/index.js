const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const jwt = require('jsonwebtoken');

const {addPost, getPostsByUser, getPosts} = require('./services/postService');
const {addUser, getUserByLogin, getAllUsers} = require('./services/userService');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        databaseURL: 'https://postmanager.firebaseio.com'
      });
}   

const app = express();
const main = express();

main.use('/postmanager', app);
main.use(bodyParser.json());
main.use(bodyParser.urlencoded({extended : false}));
main.use(cors());

app.post('/addPost', verifyJWT, (req, res) => {
  return addPost(req, res);
});

app.get('/posts', (req, res) => {
    return getPosts(req, res);
});

app.get('/posts/:login', verifyJWT, (req, res) => {
    return getPostsByUser(req, res);
});

app.post('/addUser', (req, res) => {
  return addUser(req, res);
});

app.get('/users', verifyJWT, (req, res) => {
    return getAllUsers(req, res);
});

app.get('/users/:login', verifyJWT, (req, res) => {
  return getUserByLogin(req, res);
});

function verifyJWT(req, res, next){

  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  if (!token) {
      description = "Connection token not informed!";
      status = 401;
      res.status(status);
      return res.render("./auth/login", { auth: false,  notification: {description: description, status: status} });
  }

  jwt.verify(token, process.env.SECRET, function(err, decoded) {
      if (err) {
          description = "Fail during connection token authentication!";
          status = 500;
          res.status(status);
          return res.render("./auth/login", { auth: false,  notification: {description: description, status: status} });
      }
      
      req.userId = decoded.id;
      next();
  });
}

const allFunctions = functions.https.onRequest(main);

module.exports.postManagerFunctions = allFunctions;