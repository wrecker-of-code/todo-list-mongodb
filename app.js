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

// Schemas
const itemsSchema = {
  name: String,
};

const listSchema = {
  name: String,
  items: [itemsSchema],
}

// Models
const Item = mongoose.model("Item", itemsSchema);
const List = mongoose.model("List", listSchema);


const item1 = new Item({
  name: "DefaultItem1"
});
const item2 = new Item({
  name: "DefaultItem2"
});
const item3 = new Item({
  name: "DefaultItem3"
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

  const itemName = req.body.newItem;
  // console.log(itemName);
  const listName = req.body.list;

  const item = new Item({
    name: itemName,
  })

  if (listName === "Today") {
    item.save()
      .then(() => {
        if (res.headersSent !== true) {
          res.redirect("/");
        } 
      });
  } else {
    List.findOne({ name: listName })
      .then(foundList => {
        foundList.items.push(item);
        foundList.save()
          .then(() => {
            if (res.headersSent !== true) {
              res.redirect(`/${listName}`);
            }
          })
      })
      .catch(err => {
        console.log(err);
      })
  }
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

app.get("/:customListName", function(req, res){
  const requestName = req.params.customListName
  const customListName = requestName.charAt(0).toUpperCase() + requestName.slice(1);

  List.findOne({ name: customListName })
    .then((listEntry) => {
      if (!listEntry) {
        const list = new List({
          name: customListName,
          items: defaultItems
        });
      
        list.save();
        res.redirect(`/${customListName}`);
          // .then(() => {
          //   res.redirect(`/${customListName}`);
          // })
          // .catch(err => {
          //   console.log(err);
          // })
      }
      if (res.headersSent !== true) {
        res.render("list", {listTitle: listEntry.name, newListItems: listEntry.items});
      }
    })
    .catch(err => {
      console.log(err);
    })

});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
