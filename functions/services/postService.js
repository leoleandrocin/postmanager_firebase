const functions = require('firebase-functions');
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: 'https://postmanager.firebaseio.com'
  });
}

const db = admin.firestore();
const postsRef = db.doc('postmanager/posts');

exports.addPost = (req, res) => {
  let login = req.body.login;

  let now = new Date();
  let formattedDate = now.getDate + '' + now.getMonth + '' + now.getFullYear;
  let newPost = {'title' : req.body.title, 'message' : req.body.message, 'createdAt': formattedDate, 'login' : login};

  postsRef.collection(login).collection(formattedDate).collection('posts')
    .add(newPost)
    .then(result => {
      res.status(200).send('Post successfully added: ' + result).end();
    })
    .catch(error => {
      console.log(error);
      res.status(500).send(error).end();
    });
};

/* Get all posts from all users 
* This function returns a collections of current posts (posts added at the current day)
*/
exports.getPosts = (req, res) => {
  if(req.method !== 'GET') {
    return res.status(404).json(
      {
        message: 'Method Not allowed for this request'
      }
    )
  }
  let now = new Date();
  let formattedDate = now.getDate + '' + now.getMonth + '' + now.getFullYear;
  let response_data = [];

  postsRef.get()
    .then(usersPosts => {
      usersPosts.forEach(user => {
        currentPosts = postsRef.collection(user).collection(formattedDate).collection('posts').get();
        if(currentPosts !== null && currentPosts !== undefined) {
          userJson = {
            'User' : login,
            'posts' : []
          }
          currentPosts.forEach(post => {
            userJson.posts.push({post});
          })
          response_data.push(userJson);
        }
      })
    })
    .catch(error => {
      console.log(error);
      res.status(500).send(error).end();
    });

  res.status(200).json(response_data);
};

exports.getPostsByUser = (req, res) => {
  let login = req.body.login;

  if(req.method !== 'GET') {
    return res.status(404).json(
      {
        message: 'Method Not allowed for this request'
      }
    )
  }

  let posts = [];

  postsRef.collection(login).get()
    .then(postsByDate => {
      postsByDate.forEach(date => {
        postsRef.collection(login).collection(date).collection('posts').get()
          .then(postCollection => {
            postCollection.forEach(post => {
              posts.push(...post);
            });
          })
          .catch(error => {
            console.log(error);
            res.status(500).send(error).end();
          });
      });
    })
    .catch(error => {
      console.log(error);
      res.status(500).send(error).end();
    });

  res.status(200).json(posts);
};
