//this code is for the GET endpoint. it allows to you return post with author info if author stored separate

  BlogPost
  .findOne({
    title: 'another title'
  })
  .populate('author')
  .then(function (err, post) {
    if (err) {
      console.log(err);
    } else {
      console.log(post.author.firstName, post.author.lastName);
    }
  });

  blogPostSchema.pre('findOne', function(next) {
  this.populate('author');
  next();
});


  //attempting to add comments. not sure what endpoint this goes under

BlogPost
  .findOne({
    title: 'some title'
  })
  .then(post => {
    post.comments.push({ content: 'a comment on that last comment' });
    post.save();
  });


  const BlogPost = mongoose.model('BlogPost', blogPostSchema);


  BlogPost
  .findOne({
    title: 'some title'
  })
  .then(post => {
    post.comments.id(post.comments[0]._id).remove();
    post.save();
  });


  //this code adds an author then adds their post

  Author
  .create({
    "firstName": "Sarah",
    "lastName": "Clarke",
    "userName": "sarah.clarke"
  })
  .then(author => {
    BlogPost
      .create({
        title: "another title",
        content: "a bunch more amazing words",
        author: author._id
      });
  });

