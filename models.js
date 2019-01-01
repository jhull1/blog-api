const mongoose = require("mongoose");

// this is the schema to represent a post

const authorSchema = mongoose.Schema({
  firstName: 'string',
  lastName: 'string',
  userName: {
    type: 'string',
    unique: true
  }
});
const commentSchema = mongoose.Schema({ content: 'string' });
const blogPostSchema = mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'Author' },
  created: {
    type: Date, default: Date.now,
  },
   comments: [commentSchema]
});







blogPostSchema.pre('find', function(next) {
  this.populate('author');
  next();
});

 blogPostSchema.pre('findById', function(next) {
  this.populate('author');
  next();
});

authorSchema.pre('remove', function(next) {
  blogPost
   .remove({author:this._id})
   .then(()=> next())
 });




blogPostSchema.virtual('authorName').get(function() {
  return `${this.author.firstName} ${this.author.lastName}`.trim();
});


authorSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`.trim();
});

// this is an *instance method* which will be available on all instances
// of the model. This method will be used to return an object that only
// exposes *some* of the fields we want from the underlying data
blogPostSchema.methods.serialize = function() {
  return {
    id: this._id,
    title: this.title,
    content: this.content,
    author: this.authorName, //how do i fix this now that i have a schema for authors
    comments: this.comments,
    created: this.created
  };
};

authorSchema.methods.serialize = function() { //can i use this like this or does it have to be called differently
  return {
    id: this._id,
    name: this.fullName,
    userName: this.userName
  };
};


const blogPost = mongoose.model("blogPost", blogPostSchema);
const Author = mongoose.model('Author', authorSchema);


module.exports = { blogPost, Author };
