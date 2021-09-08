const mongoose = require("mongoose");
mongoose.connect("mongodb+srv://admin_ygal:test123@cluster0.es7mi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.set('useCreateIndex', true);


const postSchema = new mongoose.Schema({
  title:String,
  content:String,
})
 module.exports = mongoose.model("post",postSchema);
