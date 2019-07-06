var express = require("express")
  , logger = require("morgan")
  , app = express()
  , template = require("pug").compileFile(__dirname + "/source/templates/homepage.pug")
  , cookieParser = require("cookie-parser")
  , session = require("express-session")
  , http = require("http").Server(app);

var cookieSession = require('cookie-session')
var io = require("socket.io")(http)
var jsonf = require("jsonfile")
var Discord = require("discord.js")

const client = new Discord.Client();
const cmd = require("./commands/commands.js");
const songmngr = require("./commands/songmngr.js");

var songlist = "./data/songlist.json";
var userlist = "./data/users.json";
var bottoken = "./data/token.json";
var nowplaying = "No Song Playing";


app.use(cookieParser("mya11fjsew234f"));
app.use(logger("dev"));
app.use(express.static(__dirname + "/static"));

app.use(cookieSession({
  name: "id",
  secret: "mya11fjsew234f",
  saveUninitialized: true,
  resave: true,
  maxAge: 1000 * 60 * 60 *24 * 365,
  signed: true,
  httpOnly: false

}));



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//PAGE REQUESTS
//connections to homepage of webserver
//TODO: implement proper session handling & authentication
app.get("/", async function (req, res, next) {
  let sess = req.session;
  var user;
  //console.log("home page sent, token " + token)
    if (sess.auth) {
      //console.log("found auth cookie");

      user = await getUserFromToken(sess.auth);

      if (user) { 

        console.log("found cookie, user is " + user.username);



      }
      else {
        console.log("user is guest")
      }

    }

    // make an array of the obj keys
    var k = [];  

    //open songlist
    jsonf.readFile(songlist, function(err, obj) {

    // loop index
    var i = 0; 

    //create numerical index array for lookup purposes
    Object.keys(obj).forEach(function (key) {
        k[i] = key;
        i++;
    });

    //pass necessary values to the jade template before rendering
    if(user) {
      //console.log("sent logged in template");
      var html = template({ "songs" : k, "nowplaying" : nowplaying, "username": user.username });
    } else {
      var html = template({ "songs" : k, "nowplaying" : nowplaying});
    }

    //send template to the client connection
    res.send(html)
     });
});

app.get("/auth/:token", async function(req, res) {
  console.log("auth page session ID: " +req.sessionID)

  var token = req.params.token;

  console.log("auth page sent, token " + token)

  var user = await getUserFromToken(token);

  if (user) { console.log("userId matched"); req.session.auth = token; }
  else { console.log("user token pair not found") }

  res.redirect("/");

  




})

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SOCKETS
//
//when socket sends connection event 
io.on("connection", function(socket){

  console.log("a user connected");

  socket.on("disconnect", function(){
    console.log("user disconnected");
  });



  //stopsong event sent by clicking stop button
  socket.on("stopsong", function() {

    //if voiceConnection exists
    if (client.voiceConnections.first()) {

    //stop playing voice
    client.voiceConnections.first().dispatcher.end();

    //update nowplaying value
    nowplaying = "No Song Playing";

    //update song listing on website
    socket.emit("updatesong", {"title": nowplaying});

    //update bot"s Game value
    client.user.setActivity(nowplaying);
  }


  });

    //songplays event sent by songmngr.playSong with the title of current song
  client.on("songplays", function(song) {
    console.log("songplays event received")

    //update nowplaying 
    nowplaying = song.title;

    //send updatesong event to the socket to update webpage
    io.emit("updatesong", {"title": nowplaying});
    
    //update "game" on bot with currently playing song
    client.user.setActivity(nowplaying);

  });

  client.on("stopsong", function() {
    console.log("updating activity")
    client.user.setActivity("Nothing");
  })

  //playsong event sent from webpage
  socket.on("playsong", function(s) {


    console.log("playsong event received with " + s);

    //run playSong with the given string as kw
    songmngr.playSong(s, client);


  });

});


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//DISCORD CLIENT
//when discord client is ready
client.on("ready", () => {
  client.user.setActivity("Nothing");
  console.log("I am ready!");

});


//when client reads a message in discord
client.on("message", message => {

  try {

    cmd.findCmd(message, client, client.guilds.first())

  } catch(e){ 

    console.log(e);

  }

});

//send login token
jsonf.readFile(bottoken, function(err, obj) {
  client.login(obj.token);
})


//start listening for connections to webserver
http.listen(process.env.PORT || 3000, function () {

  console.log("Listening on http://localhost:" + (process.env.PORT || 3000))

})



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//MISC FUNCTIONS
//getUserFromToken takes a token and checks it against users.json to see if the token is a registered user
async function getUserFromToken(token) {

  var usermatch = new Promise( function(resolve, reject) {
  jsonf.readFile(userlist, function(err, obj) {

    Object.keys(obj).forEach(function(key, index, array) {


        if(obj[key].token === token) {
          
          let userobj = { "username": obj[key].username, "id": key, "roles" : obj[key].roles}
          resolve(userobj);

        }
    
    if (index === array.length - 1) {
      resolve("");
    }
    });


  });
  });
  return usermatch;

}

