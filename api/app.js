const fs = require("fs");
const express = require("express");
const multer = require("multer");
const OAuth2Data = require("../config/credentials.json");
const googleCalenderService =require('../services/google-calendar.service');
var name,pic,events_list = []

const { google } = require("googleapis");

const app = express();
const data= {}

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
    "https://www.googleapis.com/auth/plus.login https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.profile";

app.set("view engine", "ejs");
app.use(express.static("public"));

var Storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./file");
  },
  filename: function (req, file, callback) {
    callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  },
});

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
        
        //Get calender event
        googleCalenderService.listEvents(oAuth2Client, (events) => {  
          console.log(events);
          events_list = events         
          
      });
      
        //Pass variable
      if(events_list.length === 0 ){
        res.render("success", {name: response.data.name,pic: response.data.picture,success:false,lists:false,events:events_list});
      }else{
        res.render("success", {name: response.data.name,pic: response.data.picture,success:false,lists:true,events:events_list});
      }
        

       
      }
    });



  }
});



app.post("/upload", (req, res) => {
  upload(req, res, function (err) {
    if (err) {
      console.log(err);
      return res.end("Something went wrong");
    } else {
      console.log(req.file.path);
      const drive = google.drive({ version: "v3",auth:oAuth2Client  });
      const fileMetadata = {
        name: req.file.filename,
      };
      const media = {
        mimeType: req.file.mimetype,
        body: fs.createReadStream(req.file.path),
      };
      drive.files.create(
          {
            resource: fileMetadata,
            media: media,
            fields: "id",
          },
          (err, file) => {
            if (err) {
              // Handle error
              console.error(err);
            } else {
              fs.unlinkSync(req.file.path)
              //GetCalender Service
              googleCalenderService.listEvents(oAuth2Client, (events) => {  
                console.log(events);
                events_list = events         
                 
            });
            
            //Passed parameters
            if(events_list.length === 0 ){
              res.render("success",{name:name,pic:pic,success:true,lists:false,events:events_list});
            }else{
              res.render("success",{name:name,pic:pic,success:true,lists:true,events:events_list});
            }
             
            }

          }
      );
    }
  });
});

app.get('/logout',(req,res) => {
  authed = false
  res.redirect('/')
})

app.get("/google/callback", function (req, res) {
  const code = req.query.code;
  if (code) {
    // Get an access token based on our OAuth code
    oAuth2Client.getToken(code, function (err, tokens) {
      if (err) {
        console.log("Error authenticating");
        console.log(err);
      } else {
        console.log("Successfully authenticated");
        console.log(tokens)
        oAuth2Client.setCredentials(tokens);


        authed = true;
        res.redirect("/");
      }
    });
  }
});

app.listen(5000, () => {
  console.log("App is listening on Port 5000");
});
