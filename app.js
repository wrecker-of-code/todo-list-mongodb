//jshint esversion:6
require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


mongoose.connect(process.env.MONGO_URI);

const itemsSchema = {
  name: String,
};
const Item = mongoose.model("Item", itemsSchema);
const item1 = new Item({
  name: "Web Development"
});
const item2 = new Item({
  name: "Programming"
});
const item3 = new Item({
  name: "Sport"
});

const defaultItems = [item1, item2, item3];

function insertDefaultItems() {
  Item.insertMany(defaultItems)
  .then(function() {
    console.log("Successfully inserted the default items into the data collection.");
  })
  .catch(function(err) {
    console.log(err);
  });
}


app.get("/", function(req, res) {
  let items = [];
  Item.find({})
    .then((itemList) => {
      if (!itemList || itemList.length === 0) {
        insertDefaultItems();
        res.redirect("/");
      }
      // console.log(itemList);
      items = itemList;
    })
    .catch((err) => {
      console.log(err);
      items = [];
    })
    .finally(() => {
      if (res.headersSent !== true) {
        res.render("list", {listTitle: "Today", newListItems: items});
      }
    });


});

app.post("/", function(req, res){

  const item = req.body.newItem;

  Item.insertMany([{ name: item }])
    .then(() => {
      console.log(`Successfully inserted ${item} into items`);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      res.redirect("/");
    });
});


app.post("/delete", function(req, res){
  const checkboxValues = JSON.parse(req.body.checkbox);
  // console.log(checkboxValues);
  Item.deleteOne({ _id: checkboxValues.id })
    .then(() => {
      console.log(`Successfully deleted ${checkboxValues.name} from the items collections.`);
    })
    .catch(err => {
      console.log(err);
    })
    .finally(() => {
      res.redirect("/");
    });

});

app.get("/category/:name", function(req, res){
  const categoryName = req.params.name;
  res.render("list", {listTitle: categoryName, newListItems: []});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
