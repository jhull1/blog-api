require('dotenv').config()

const express = require('express');
const morgan = require('morgan');
const mongoose = require("mongoose");
// Mongoose internally uses a promise-like object,
// but its better to make Mongoose use built in es6 promises
mongoose.Promise = global.Promise;

// config.js is where we control constants for entire
// app like PORT and DATABASE_URL
const { PORT, DATABASE_URL } = require("./config");
const { blogPost, Author } = require("./models");

const app = express();
app.use(morgan('common'));
app.use(express.json());

// GET requests to /posts

app.get("/posts", (req, res) => {
  blogPost.find() 
   .populate('author')  
    .then(posts => {
      console.log(posts)
      res.json({
        posts: posts.map(post => post.serialize())
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    });
});

// can also request by ID
app.get("/posts/:id", (req, res) => {
  blogPost
    // this is a convenience method Mongoose provides for searching
    // by the object _id property
    .findById(req.params.id)
    .populate('author')  //will this work? do i need this
    //.then(post => res.json(post.serialize()))

    .then(post => { //need help adding comments here
    post.comments.push(
          { "content": "Here is a first comment." },
          { "content": "Here is a second comment." },
          { "content": "Here is a third comment." }
      );
    //post.save()
    return post;
})
    .then(post => {

      console.log(post)
    res.json(post.serialize())

})
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    });
});


app.post('/posts', (req, res) => {
  // ensure `title`, `author` and `content` are in request body
  const requiredFields = ['title', 'content', 'author'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  
  }


  blogPost.create({
    title: req.body.title,
     content: req.body.content,
     author: req.body.author 
     })
.then(post => res.status(201).json(post.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: err.message });


    });
});


app.put("/posts/:id", (req, res) => {
  // ensure that the id in the request path and the one in request body match
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    const message =
      `Request path id (${req.params.id}) and request body id ` +
      `(${req.body.id}) must match`;
    console.error(message);
    return res.status(400).json({ message: message });
  }

  // we only support a subset of fields being updateable.
  // if the user sent over any of the updatableFields, we udpate those values
  // in document
  const toUpdate = {};
  const updateableFields = ["title", "content"];

  updateableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });

  blogPost
    // all key/value pairs in toUpdate will be updated -- that's what `$set` does
    .findByIdAndUpdate(req.params.id, { $set: toUpdate })
    .then(post => res.status(204).end())
    .catch(err => res.status(500).json({ message: "Internal server error" }));
});

app.delete("/posts/:id", (req, res) => {
  blogPost.findByIdAndRemove(req.params.id)
    .then(restaurant => res.status(204).end())
    .catch(err => res.status(500).json({ message: "Internal server error" }));
});




//author endpoints

app.get('/authors', (req, res) => {
  Author
    .find()
    .then(authors => {
      res.json(authors.map(author => author.serialize()));
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'something went wrong' });
    });
});


app.post('/authors', (req, res) => {
  const requiredFields = ['firstName', 'lastName', 'userName'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  
  }


  Author
    .findOne({ userName: req.body.userName })
    .then(author => {
      if (author) {
        const message = `Username already taken`;
        console.error(message);
        return res.status(400).send(message);
      }

      else {
        Author
          .create({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            userName: req.body.userName
          })
          //.then(author => res.status(201).json({
              //_id: author.id,
              //name: `${author.firstName} ${author.lastName}`,
              //userName: author.userName
           

          .then(author => res.status(201).json(author.serialize()))
      }
    })
    .catch(err => {
      console.error(err);
      res.status(400).json({ message: err.message });
    })

        

    
});

app.put("/authors/:id", (req, res) => {
  // ensure that the id in the request path and the one in request body match
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    const message =
      `Request path id (${req.params.id}) and request body id ` +
      `(${req.body.id}) must match`;
    console.error(message);
    return res.status(400).json({ message: message });
  }

  // we only support a subset of fields being updateable.
  // if the user sent over any of the updatableFields, we udpate those values
  // in document
  const toUpdate = {};
  const updateableFields = ["firstName", "lastName", "userName"];

  updateableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });

  //author
    // all key/value pairs in toUpdate will be updated -- that's what `$set` does
    //.findByIdAndUpdate(req.params.id, { $set: toUpdate })
    //.then(post => res.status(204).end())
   // .catch(err => res.status(500).json({ message: "Internal server error" }));
//});

Author
    .findOne({ userName: updated.userName, _id: { $ne: req.params.id } })
    .then(author => {
      if(author) {
        const message = `Username already taken`;
        console.error(message);
        return res.status(400).send(message);
      }
      else {
        Author
          .findByIdAndUpdate(req.params.id, { $set: updated }, { new: true })
          .then(updatedAuthor => {
            res.status(200).json({
              id: updatedAuthor.id,
              name: `${updatedAuthor.firstName} ${updatedAuthor.lastName}`,
              userName: updatedAuthor.userName
            });
          })
          .catch(err => res.status(500).json({ message: err }));
      }
    });
});






//again issue with checking if username already exists

app.delete("/authors/:id", (req, res) => {
  Author
    .findByIdAndRemove(req.params.id)
    .then(author => res.status(204).json({message: "Successfully deleted posts and author"}))
    .catch(err => res.status(500).json({ message: "Internal server error" }));
});


// catch-all endpoint if client makes request to non-existent endpoint
//app.use("*", function(req, res) {
  //res.status(404).json({ message: "Not Found" });
//});


// both runServer and closeServer need to access the same
// server object, so we declare `server` here, and then when
// runServer runs, it assigns a value.
let server;

// this function connects to our database, then starts the server
function runServer(databaseUrl, port = PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(
      databaseUrl,
      err => {
        if (err) {
          return reject(err);
        }
        server = app
          .listen(port, () => {
            console.log(`Your app is listening on port ${port}`);
            resolve();
          })
          .on("error", err => {
            mongoose.disconnect();
            reject(err);
          });
      }
    );
  });
}

// this function closes the server, and returns a promise. we'll
// use it in our integration tests later.
function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log("Closing server");
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

// if server.js is called directly (aka, with `node server.js`), this block
// runs. but we also export the runServer command so other code (for instance, test code) can start the server as needed.
if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };
