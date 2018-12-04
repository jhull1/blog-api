
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();


const {BlogPosts} = require('./models');

//const blogPostsRouter = require('./blogPostsRouter');
//const app = express();


//adding some blog posts so there's something to retrieve. 

BlogPosts.create('Welcome to Thinkful','First you sign up and select a program','Program Manager');
BlogPosts.create('Start Your Program','Now you do all the readings, attend sessions and submit your projects','Thinkful Mentor');
BlogPosts.create('Make a Portfolio and Resume','Next you polish all your work and organize it, and prepare for interviews','Career Services Team');

// when the root of this router is called with GET, return
// all current BlogPost items
router.get('/', (req, res) => {
  res.json(BlogPosts.get());
});

router.post('/', jsonParser, (req, res) => {
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



   const item = BlogPost.create(req.body.title, req.body.content,req.body.author );
  res.status(201).json(item);
});

// when PUT request comes in with updated item, ensure has
// required fields. also ensure that item id in url path, and
// item id in updated item object match. if problems with any
// of that, log error and send back status code 400. otherwise
// call `ShoppingList.update` with updated item.
router.put('/:id', jsonParser, (req, res) => {
  const requiredFields = ['title', 'content', 'author', 'id','publishDate'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }


  if (req.params.id !== req.body.id) {
    const message = `Request path id (${req.params.id}) and request body id (${req.body.id}) must match`;
    console.error(message);
    return res.status(400).send(message);
  }
  console.log(`Updating blog post with id \`${req.params.id}\``);
  BlogPosts.update({
    id: req.params.id,
    title: req.body.title,
    content: req.body.content,
    author: req.body.author,
    publishDate: req.body.publishDate
  });
  res.status(204).end();
});

router.delete('/:id', (req, res) => {
  BlogPosts.delete(req.params.id);
  console.log(`Deleted blog post \`${req.params.ID}\``);
  res.status(204).end();
})

module.exports = router;