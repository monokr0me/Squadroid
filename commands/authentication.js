var crypto = require('crypto')
    , fs = require('fs')
    , jsonf = require('jsonfile');
    
var userlist = './data/users.json';

//input userID, check if they have a token. Return token if true, generate one otherwise
exports.authUser = async function(user, m, c) {


    var newuser = createUser(user, m, c);
    var tokenmatch = newuser.token;
    console.log("generated token " + tokenmatch)

    var url = "/auth/" + tokenmatch;
    m.author.send("click here to login: http://localhost:3000" + url + "\n DO NOT share this link, treat it like a password!");

}

function createUser(user, m, c) {



    let token = crypto.randomBytes(48).toString('hex');
    



    let username = user.username;
    let id = user.id;
    let roleCollection = Array.from(m.member.roles.values());
    let roles = [];
    for (let i = 0; i < roleCollection.length; i++) {

        roles[i] = { "name": roleCollection[i].name, "id" : roleCollection[i].id }

    }

        

    let userobj = {"username" : username, "id" : id, "token" : token, "roles" : roles }


    let lobj = {};
    jsonf.readFile(userlist, function (err, obj) {
        lobj = obj;
        if (err) {console.error(err);}

    });
    lobj[id] = userobj;
    jsonf.writeFile(userlist, lobj, {spaces: 2}, function(err) {

        

    });

    return userobj;


}