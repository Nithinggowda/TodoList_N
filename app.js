//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Nithin_2023:nithin2002@cluster0.a8ewobq.mongodb.net/?retryWrites=true&w=majority/todolistDB");
const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("item",itemsSchema);
const DSA = new Item({
  name: "DSA"
});
const Project = new Item({
  name: "Project"
});
const Java = new Item({
  name: "Java"
});

const defaultItems = [DSA,Project,Java];

const listschema = {
  name : String,
  items: [itemsSchema]
};
const List = mongoose.model("List",listschema);


app.get("/", function(req, res) {

  Item.find({}).then(function(foundItems){

    if(foundItems.length === 0)
    {
      Item.insertMany(defaultItems).catch(function(err){console.log(err);});
      res.redirect("/");
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }

  })
  .catch(function(err){
    console.log(err);
  })
});


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });

  if(listName === "Today")
  {
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listName}).then(function(foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    }).catch(function(err){
      console.log(err);
    })
  }

});

app.post("/delete",function(req,res){
const checkedItemId = req.body.checkbox;
const listName = req.body.listName;

if(listName === "Today")
{
  Item.findByIdAndRemove({_id: checkedItemId}).catch(function(err){console.log(err);})
  res.redirect("/");
}
else{
  List.findOneAndUpdate({name: listName},{$pull:{items:{_id:checkedItemId}}}).catch(function(err){console.log(err);})
  res.redirect("/"+listName);
}
})

app.get("/:customListName",function(req,res){
const customListName = _.capitalize(req.params.customListName);
List.findOne({name:customListName}).then(function(foundItem){
  if(!foundItem){
    //cretae a new list
    const list = new List({
      name: customListName,
      items: []
    });
    list.save();
    res.redirect("/"+customListName);
  }else{
    //show existing list
    res.render("list",{listTitle: foundItem.name, newListItems: foundItem.items});
  }
}).catch(function(err){
  console.log(err);
})

});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
