const functions = require('firebase-functions');
const admin = require('firebase-admin');
const {validateUser} = require('./authenticationService');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: 'https://postmanager.firebaseio.com'
  });
}

const db = admin.firestore();
const userRef = db.doc('postmanager/users');

exports.addUser = (req, res) => {
  let login = req.body.login;
  let password = req.body.password;
  let confirmPassword = req.body.confirmPassword;

  let validationResponse = validateUser(login, password, confirmPassword);
  if(validationResponse.exist === null) {
    return res.status(500).send({'error' : validationResponse.error, statusCode: 500}).end();
  } else if(validationResponse.exist === false) {
    return res.status(404).send({'errorMsg' : validationResponse.errorMsg, statusCode: 404}).end();
  }

  let now = new Date();
  let formattedDate = now.getDate + '' + now.getMonth + '' + now.getFullYear;
  let newUser = {'login' : login, 'password' : password, 'createdAt': formattedDate};

  userRef.add(newUser)
    .then(result => {
      res.status(200).send('User successfully added: ' + result).end();
    })
    .catch(error => {
      console.log(error);
      res.status(500).send(error).end();
    });
};

/* Get all users */
exports.getAllUsers = (req, res) => {
  if(req.method !== 'GET') {
    return res.status(404).json(
      {
        message: 'Method Not allowed for this request'
      }
    )
  }

  let response_data = [];

  userRef.get()
    .then(users => {
      users.forEach(user => {
        if(user !== null && user !== undefined) {
          response_data.push(user);
        }
      })
    })
    .catch(error => {
      console.log(error);
      res.status(500).send(error).end();
    });

  res.status(200).json(response_data);
};

exports.getUserByLogin = (req, res) => {
  let login = req.body.login;

  if(req.method !== 'GET') {
    return res.status(404).json(
      {
        message: 'Method Not allowed for this request'
      }
    )
  }

  let response_data = null;

  userRef.doc(login).get()
    .then(user => {
      response_data = {
        'User' : user
      }
    })
    .catch(error => {
      console.log(error);
      res.status(500).send(error).end();
    });

  res.status(200).json(response_data);
};