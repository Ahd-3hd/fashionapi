const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.options("*", cors());

var cloundinary = require("cloudinary").v2;
var fileupload = require("express-fileupload");
const contentful = require("contentful-management");
const client = contentful.createClient({
  accessToken: "CFPAT-evF3kfedb303Zvpm5XQ0-Od0O5EYwPwGwF5L3IZjAmI",
});

cloundinary.config({
  cloud_name: "ahd3hd",
  api_key: "674886723274764",
  api_secret: "ZCdFWT9NvJOJEm5k-mYJmg65pgQ",
});
const port = process.env.PORT || 9000;
app.use(
  fileupload({
    useTempFiles: true,
  })
);
//1ns54xwgpy4p

app.get("/products", (req, res) => {
  let data;
  let extractedData = [];
  client
    .getSpace("1ns54xwgpy4p")
    .then((space) => space.getEnvironment("master"))
    .then((environment) => environment.getEntries()) // you can add more queries as 'key': 'value'
    .then((response) => {
      data = response.items;
      data.forEach((x) => {
        extractedData.push(x.fields);
      });
      return res.send(extractedData);
    })
    .catch(console.error);
});
app.get("/store/:id", (req, res) => {
  id = req.params.id;
  let data;
  console.log(id);
  client
    .getSpace("1ns54xwgpy4p")
    .then((space) => space.getEnvironment("master"))
    .then((environment) =>
      environment.getEntries({
        content_type: "products",
        "fields.id": id,
      })
    ) // you can add more queries as 'key': 'value'
    .then((response) => {
      return res.send(response.items[0].fields);
      // data = response.items;
      // console.log(data);
      // return res.send(data[id - 1].fields);
    })
    .catch(console.error);
});
app.post("/create", (req, res) => {
  let total = 0;
  const file = req.files.photo;
  const title = req.body.title;
  const price = req.body.price;
  const desc = req.body.desc;
  const type = req.body.type;
  let imageUrl;
  client
    .getSpace("1ns54xwgpy4p")
    .then((space) => space.getEnvironment("master"))
    .then((environment) => environment.getEntries())
    .then((res) => {
      total = res.total;
      total++;
    })
    .then(
      cloundinary.uploader.upload(file.tempFilePath, (err, result) => {
        imageUrl = result.url;
        client
          .getSpace("1ns54xwgpy4p")
          .then((space) => space.getEnvironment("master"))
          .then((environment) => {
            return environment.createEntry("products", {
              fields: {
                title: {
                  "en-US": title,
                },
                price: {
                  "en-US": price.toString(),
                },
                imageurl: {
                  "en-US": imageUrl,
                },
                desc: {
                  "en-US": desc,
                },
                type: {
                  "en-US": type,
                },
                id: {
                  "en-US": total,
                },
              },
            });
          })
          .then((entry) => {
            return entry.publish();
          })
          .catch(console.error);
        res.json({
          success: "yep!",
          product: {
            total,
            title,
            price,
            desc,
            imageUrl,
          },
        });
      })
    )
    .catch(console.log);
});

app.listen(port, () =>
  console.log(`app listening at http://localhost:${port}`)
);
