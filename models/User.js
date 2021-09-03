const mongoose = require("mongoose");
const passportLocalMongoose = require('passport-local-mongoose');
const findOrCreate = require('mongoose-findorcreate');
const MONGO_URL = "mongodb+srv://admin_ygal:test123@cluster0.es7mi.mongodb.net/myFirstDatabase1?retryWrites=true&w=majority";

mongoose.connect(process.env.MONGODB_URI ||"mongodb://localhost:27017/fbAuth", {
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
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
mongoose.connection.on('connected', () => {
    console.log('Mongoose is connected!!!!');
});

// Data parsing


module.exports = mongoose.model("user",userSchema);
