const songs = require('./songmngr.js');


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

                            m.reply("Error: Valid youtube link not found")

                        }

                    }

                    else if (cmd[1] === "playsong") {

                        console.log("found cmd playsong");
                        if (cmd[2] && true) { //placeholder for uRL verification

                            songs.playSong(cmd[2], c);

                        } else {

                            songs.playSong("*", c)

                        }

                    }

                    else if (cmd[1] === "stopsong") {

                        if(c.voiceConnections.first()) {

                            c.voiceConnections.first().dispatcher.end();


                        }
                    }

                    else if (cmd[1] ==="joinme") {

                        if (m.member.voiceChannel) {

                            console.log("found user in channel " + m.member.voiceChannel.name)
                            m.member.voiceChannel.join().then(connection => {

                            

                            

                            });


                        } else {console.log("could not find channel")}

                    }
                    else if (cmd[1] ==="leave") {

                        if (c.voiceConnections.first()) {

                            
                            c.voiceConnections.first().disconnect();


                        } else {console.log("bot not in voice channel")}

                    }

                }

    }

}
