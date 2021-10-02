const fs = require("fs");
const express = require("express");
const multer = require("multer");
const OAuth2Data = require("../config/credentials.json");
var name,pic

const { google } = require("googleapis");

const app = express();


const CLIENT_ID = OAuth2Data.web.client_id;
const CLIENT_SECRET = OAuth2Data.web.client_secret;
const REDIRECT_URL = OAuth2Data.web.redirect_uris[0];

const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URL
);
var authed = false;

// If modifying these scopes, delete token.json.
const SCOPES =
    "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.profile";

app.set("view engine", "ejs");
app.use(express.static("public"));


var upload = multer({
  storage: Storage,
}).single("file"); //Field name and max count

app.get("/", (req, res) => {
  if (!authed) {
    // Generate an OAuth URL and redirect there
    var url = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
    });
    console.log(url);
    res.render("index", { url: url });
  } else {
    var oauth2 = google.oauth2({
      auth: oAuth2Client,
      version: "v2",
    });
    oauth2.userinfo.get(function (err, response) {
      if (err) {
        console.log(err);
      } else {
        console.log(response.data);
        name = response.data.name
        pic = response.data.picture
        res.render("success", {
          name: response.data.name,
          pic: response.data.picture,
          success:false
        });
      }
    });
  }
});
