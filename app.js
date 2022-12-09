const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();
let workItems = [];
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
mongoose.connect(
  "mongodb+srv://admin-Nick:test123@cluster0.mmgfoqa.mongodb.net/todoDB"
);
const listSchema = {
  name: String,
};
const Item = mongoose.model("Item", listSchema);

const list1 = new Item({
  name: "Enter task in your list",
});

const list2 = new Item({
  name: "+ button to add",
});

const list3 = new Item({
  name: "click on checkbox to delete",
});
const defaultList = [list1, list2, list3];

const listSchema2 = {
  name: String,
  items: [listSchema],
};

const customList = mongoose.model("customList", listSchema2);

app.get("/", function (req, res) {
  Item.find({}, function (err, fItem) {
    if (fItem.length === 0) {
      Item.insertMany(defaultList, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("added");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: fItem });
    }
  });
});

app.get("/:customName", async function (req, res) {
  const customName = _.capitalize(req.params.customName);

  try {
    const fList = await customList.findOne({ name: customName });
    if (!fList) {
      // Creates a new list
      const newitems = new customList({
        name: customName,
        items: defaultList,
      });
      await newitems.save();
      res.redirect("/" + customName);
    } else {
      // Show an exsisting list
      res.render("list", {
        listTitle: fList.name,
        newListItems: fList.items,
      });
    }
  } catch (error) {
    console.log(error);
  }

  // customList.findOne({ name: customName }, function (err, fList) {
  //   if (!err) {
  //     if (!fList) {
  //       // Creates a new list
  //       const newitems = new customList({
  //         name: customName,
  //         items: defaultList,
  //       });
  //       newitems.save()
  //     }
  //     else {
  //       // Show an exsisting list
  //       res.render("list", {
  //         listTitle: fList.name,
  //         newListItems: fList.items,
  //       });
  //     }
  //   }
  // });
});

app.post("/", function (req, res) {
  let itemName = req.body.newItem;
  const listName = req.body.submit;

  const item = new Item({
    name: itemName,
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    customList.findOne({ name: listName }, function (err, fList) {
      fList.items.push(item);
      fList.save();
      res.redirect("/" + listName);
    });
  }
});
app.post("/delete", function (req, res) {
  const dId = req.body.cBox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(dId, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("deleted");
      }
    });
    res.redirect("/");
  } else {
    customList.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: dId } } },
      function (err, fList) {
        if (!err) {
          res.redirect("/" + listName);
        }
      }
    );
  }
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function () {
  console.log("Server started at port 3000");
});
