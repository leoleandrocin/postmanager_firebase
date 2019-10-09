const functions = require('firebase-functions');
const admin = require('firebase-admin');
var CryptoJS = require("crypto-js");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: 'https://postmanager.firebaseio.com'
  });
}

const database = admin.database();

exports.validateUser = (login, password, confirmPassword) => {

  var validation = passwordValidation(password, confirmPassword);

  if(validation == null) {
    database.ref(`/postmanager/${login}`)
    .once('value', (snapshot) => {
      if(snapshot !== null && snapshot !== undefined) {
        return response = {
          'exist' : true
        };
      }
      else {
        return response = {
          'exist' : false,
          'errorMsg' : 'There is no user with this credential.'
        };
      }
    })
    .catch(error => {
      return response = {
        'exist' : false,
        error
      };
    });  
  }
  else {
    return response = {
      'exist' : false,
      'errorMsg' : 'Invalid user credentials.'
    };
  }

  
};

function passwordValidation(password, passwordConfirmation){

  var password = CryptoJS.AES.decrypt(password, cryp).toString(CryptoJS.enc.Utf8);
  var passwordConfirmation = CryptoJS.AES.decrypt(passwordConfirmation, cryp).toString(CryptoJS.enc.Utf8);

  if(password != passwordConfirmation)
  {
      return "Password and confirmation not combined!";
  }
  return null;
}
