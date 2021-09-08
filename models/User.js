const mongoose = require("mongoose");
const passportLocalMongoose = require('passport-local-mongoose');
const findOrCreate = require('mongoose-findorcreate');
mongoose.connect("mongodb+srv://admin_ygal:test123@cluster0.es7mi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.set('useCreateIndex', true);

const userSchema = new mongoose.Schema({
  uid:String,
  token:String,
  email:String,
  name:String,
  gender:String,
  pic:String,
});
// const postSchema = new mongoose.Schema({
//   title:String,
//   content:String,
// })


userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
// postSchema.plugin(findOrCreate);
module.exports = mongoose.model("user",userSchema);
// module.exports = mongoose.model("post",postSchema);
