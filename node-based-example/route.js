const express = require("express");
const ces = require("./main");
const app = express();
const path = require("path");
var formidable = require("formidable");
var fs = require("fs");
const port = 3000;
app.use(express.static(`${__dirname}/public`));
app.get("/", (req, res) => {
  // res.send("Hello World!");
  res.sendFile("index.html", { root: __dirname });
});

app.get("/assetids", (req, res) => {
  data = ces.getAssetIds();
  data.then((resp) => {
    console.log(resp);
    resp = JSON.stringify(resp);
    res.send(resp);
  });
});

app.post("/assetid/:asset", (req, res) => {
  let asset = req.params.asset;
  data = ces.getAssetIdStatus(asset);
  data.then((resp) => {
    // console.log(resp);
    resp = JSON.stringify(resp);
    res.send(resp);
  });
});

app.get("/uploads", (req, res) => {
  const data = ces.uploadFiles();
  data.then((resp) => {
    console.log(resp);
    ces.afterUploadReq(resp);
    resp = JSON.stringify(resp);
    res.send(resp);
  });
});

app.post("/fileUpload", (req, res) => {
  var form = new formidable.IncomingForm();
  //Process the file upload in Node
  form.parse(req, function (error, fields, file) {
    console.log(file);
    let filepath = file.userFile.filepath;
    let newpath = path.join(__dirname, "files/");
    newpath += file.userFile.originalFilename;
    console.log(filepath);
    console.log(newpath);
    //Copy the uploaded file to a custom folder
    fs.rename(filepath, newpath, function () {
      //Send a NodeJS file upload confirmation message
      const data = ces.uploadFiles(file.userFile.originalFilename);
      // const fileName = data["fileName"];
      data.then((resp) => {
        // console.log(resp);
        ces.afterUploadReq(resp, file.userFile.originalFilename);
        resp = JSON.stringify(resp);
        res.send("Tiling started!!");
      });
      // res.write("NodeJS File Upload Success!");
      // res.end();
    });
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});
