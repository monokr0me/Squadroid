var crypto = require('crypto')
    , fs = require('fs')
    , jsonf = require('jsonfile');
    
var userlist = './data/users.json';

//input userID, check if they have a token. Return token if true, generate one otherwise
exports.authUser = async function(user, m, c) {


    var newuser = createUser(user);
    var tokenmatch = newuser.token;
    console.log("generated token " + tokenmatch)

    var url = "/auth/" + tokenmatch;
    m.author.send("click here to login: http://localhost:3000" + url + "\n DO NOT share this link, treat it like a password!");

}

function createUser(user) {



    var token = crypto.randomBytes(48).toString('hex');
    



    var username = user.username;
    var id = user.id;
    var userobj = {"username" : username,"id" : id }
    userobj["token"] = token;

    var lobj = {};
    jsonf.readFile(userlist, function (err, obj) {
        lobj = obj;
        if (err) {console.error(err);}

    });
    lobj[id] = userobj;
    jsonf.writeFile(userlist, lobj, {spaces: 2}, function(err) {

        

    });

    return userobj;


}