var songs = require('./songmngr.js');
var auth = require('./authentication');

// m = message, c = client g = guild
exports.findCmd = function(m, c, g) {

    if(m.content.match(/\/d/gi)) {

        console.log("guild " + g.name)

        
            console.log("found cmd operator");
        

            var cmd = m.content.split(" ");

                if (cmd[1]) {

                    if (cmd[1] === "ping") {

                        console.log("found cmd ping");
                        m.reply("pong");

                    }
                    else if (cmd[1] === "addsong") {

                        console.log("found cmd addsong");
                        if (cmd[2] && true) { //placeholder for uRL verification

                            songs.addSong(cmd[2], c);

                        } else {
                            sendError(m, c, "I don't recognize that as a valid song. Make sure it is a standard youtube link")

                        }

                    }

                    else if (cmd[1] === "playsong") {

                        console.log("found cmd playsong");
                        if (cmd[2] && true) { //placeholder for URL verification
                            let songreq = '';
                            for (i = 2; i < cmd.length; i++) {
                                songreq = songreq + ' ' + cmd[i]
                            }
                            console.log('song str: ' + songreq)
                            songs.playSong(songreq, c)

                        } else {

                            songs.playSong("*", c)

                        }

                    }

                    else if (cmd[1] === "stopsong") {

                        if(c.voiceConnections.first()) {

                            c.voiceConnections.first().dispatcher.end();


                        }
                        c.emit('stopsong');
                    }

                    else if (cmd[1] ==="joinme") {

                        if (m.member.voiceChannel) {

                            console.log("found user in channel " + m.member.voiceChannel.name)
                            m.member.voiceChannel.join().then(connection => {

                            

                            

                            });


                        } else {
                            console.log("could not find channel")
                            sendError(m, c, "You are not in a voice channel I can join, or something is wrong with me.")
                        }

                    }
                    else if (cmd[1] === "leave") {

                        if (c.voiceConnections.first()) {

                            
                            c.voiceConnections.first().disconnect();


                        } else {console.log("bot not in voice channel")}

                    }

                    else if (cmd[1] === "authme") {

                        doAuth(m, c);
                        

                    }

                }
        m.delete()
            .then(msg => console.log(`Deleted message from ${msg.author.username}`))
            .catch(console.error);

    }

}

async function doAuth(m, c) {

    auth.authUser(m.author, m, c);
    

}
//DM an error to the user who sent command
async function sendError(m, c, e) {
    let dmChannel = m.author.sendMessage(e)
}