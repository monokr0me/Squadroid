var express = require('express')
  , logger = require('morgan')
  , app = express()
  , template = require('jade').compileFile(__dirname + '/source/templates/homepage.jade')
  , session = require('express-session')
  , filestore = require('session-file-store')(session)
  , http = require('http').Server(app)
  , cookieParser = require('cookie-parser');

var io = require('socket.io')(http)
var passport = require('passport')
var jsonf = require('jsonfile')
var Discord = require('discord.js')
 
const client = new Discord.Client();
const cmd = require('./commands/commands.js');
const songmngr = require('./commands/songmngr.js');

var songlist = './data/songlist.json';
var userlist = './data/users.json';
var bottoken = './token/token.json';
var nowplaying = 'No Song Playing';
var AnonymousStrategy = require('passport-anonymous').Strategy

app.use(logger('dev'));
app.use(express.static(__dirname + '/static'));
app.use(session({
  name: 'server-session-cookie-id',
  secret: 'somerandombullshitlul',
  saveUninitialized: true,
  resave: true,
  store: new filestore(),

  cookie: {

    path: "/",
    httpOnly: true,
    secure: true

  }

}));
app.use(cookieParser());

passport.use(new AnonymousStrategy());



//connections to homepage of webserver
//TODO: implement proper session handling & authentication
app.get('/', function (req, res, next) {

  try {

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
    var html = template({ 'songs' : k, 'nowplaying' : nowplaying });

    //send template to the client connection
    res.send(html)
     });
  } catch (e) {

    next(e)

  }
});
//change

app.get('/auth/:token', function(req, res) {

  var token = req.params.token;

  console.log("auth page sent, token " + token)

  jsonf.readFile(userlist, function(err, obj) {

    console.log("opened userlist")

    Object.keys(obj).forEach(function(key) {

        console.log("checking key " + key)
        console.log("checking auth for user " + obj[key].username) 

        if(obj[key].token === token) {
          res.cookie("testcookie" , 'cookie_value').send('Cookie is set, SUP ' + obj[key].username);
          
          console.log("auth found for " + obj[key].username);

        }

    });

  });


})

//when socket sends connection event 
io.on('connection', function(socket){

  console.log('a user connected');

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });



  //stopsong event sent by clicking stop button
  socket.on('stopsong', function() {

    //if voiceConnection exists
    if (client.voiceConnections.first()) {

    //stop playing voice
    client.voiceConnections.first().dispatcher.end();

    //update nowplaying value
    nowplaying = 'No Song Playing';

    //update song listing on website
    socket.emit('updatesong', {'title': nowplaying});

    //update bot's Game value
    client.user.setGame(nowplaying);
  }


  });

    //songplays event sent by songmngr.playSong with the title of current song
  client.on('songplays', function(song) {
    console.log("songplays event received")

    //update nowplaying 
    nowplaying = song.title;

    //send updatesong event to the socket to update webpage
    io.emit('updatesong', {'title': nowplaying});
    
    //update "game" on bot with currently playing song
    client.user.setGame(nowplaying);

  });

  //playsong event sent from webpage
  socket.on('playsong', function(s) {


    console.log("playsong event received with " + s);

    //run playSong with the given string as kw
    songmngr.playSong(s, client);


  });

});


  
//when discord client is ready
client.on('ready', () => {

  console.log('I am ready!');

});


//when client reads a message in discord
client.on('message', message => {

  try {

    cmd.findCmd(message, client, client.guilds.first())

  } catch(e){ 

    console.log(e);

  }

});

//send login token
//TODO: remove hardcoded token for security
jsonf.readFile(bottoken, function(err, obj) {
  client.login(obj.token);
})


//start listening for connections to webserver
http.listen(process.env.PORT || 3000, function () {

  console.log('Listening on http://localhost:' + (process.env.PORT || 3000))

})
