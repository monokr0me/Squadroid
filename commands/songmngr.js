const ytdl = require('ytdl-core');
const fs = require('fs');
const jsonf = require('jsonfile');
var file = './data/songlist.json'

//url = url of song (youtube only), c = client obj of bot
exports.addSong = function(url, c) {

    //lots of things to go wrong when read/writing files, want to make sure we catch them
    try {

        //temporary store for the loaded data
        var lobj = {};

        //read from file and store the object in lobj
        jsonf.readFile(file, function(err, obj) { lobj = obj;});

        //get video info with ytdl, create an obj with relevant info and write it back to songlist.json
        ytdl.getInfo(url, function(err, info) {

            //construct the object for the song info 
            var vidinfo = {title: info.title, data: url};

            //add the new vidinfo obj to the temporary json
            lobj[vidinfo.title] = vidinfo;

            //write lobj back to the file
            jsonf.writeFile(file, lobj, {spaces: 2}, function(err) {

                if (err) {console.error(err);}

            });

        });

    } catch (e) {
        console.log(e);
    }


}
// kw = keyword to search for (in song title), c = client obj of bot


//kw = kw to search for a song, c = client obj of bot
exports.playSong = function(kw, c) {

    //first, make sure the voice connection exists
    if(c.voiceConnections.first()) {

        vcOut = c.voiceConnections.first();
        var song = {};
        jsonf.readFile(file, function(err, obj) {
            song = pickSong(obj, kw);
        
        //ensure that the song obj returned exists
        if (song != null) {

            console.log("song " + song.title + " processed");

            //create the stream from the url of the song
            stream = ytdl(song.data, {filter: "audioonly"});

            //send the stream to the voice channel
            vcOut.playStream(stream, {volume: 0.2});

            //emit the songplays event, used to update info for the web interface
            c.emit('songplays', song);
            console.log("songplays event sent");


        //in case the song object isn't found, this is likely an indexing error
        } else { console.log("error: song not processed")}
        });

    //in case the bot is not connected to a voice channel
    } else { console.log("ERROR: no voice connection")}


}


//keys = array of keys created to index the obj; 
//obj = the json object of songs we are searching;
//kw = the keyword we are searching for
function pickSong(obj, kw) {
    //if no kw is given
    if (!kw) { 
        console.log("returning random song, no kw");
        //select a random index within the song list
        return Math.floor(Math.random() * (Object.keys(obj).length - 1)) + 1; 
    //if a kw is given
    } else { 
        console.log("searching for song " + kw);

        //data parsed with an & in it will cause problems, so we replace it
        var queue = kw.replace(/&amp;/g, '&'); 

        //use the quote function to sanitize the kw input before creating the regexp pattern
        var newqueue = new RegExp(RegExp.quote(queue), "i"); 

        // array for all matching songs
        var found = []; 

        // index for found array
        var j = 0; 

        //number of keys
        var size = Object.keys(obj).length;
        Object.keys(obj).forEach(function(key) {
            if (key.match(newqueue)) {

                found[j] = obj[key];
                j++;
            }


        });

            // if we get to the end of the array with no matches, return a random song
        if (found.length == 0) {
            
            console.log("search failed for " + kw + ", returning random");

            //select a random index within the song list
            return Math.floor(Math.random() * (Object.keys(obj).length - 1)) + 1; 
        }
        //if we have multiple matches, select one at random
        else if(found.length > 1) { 

            //aIndex is used to match the key from found[] back to the original keys[] array
            var aIndex = Math.floor(Math.random() * (found.length - 1)) + 1;

        //if only 1 song is matched, set the index to 0 to match that one song            
        } else { var aIndex = 0;}

        return found[aIndex];
    }
}


//function for escaping all potential RegExp keywords from input
RegExp.quote = function(str) {
    return (str+'').replace(/[.?*+^$[\]\\(){}|-]/g, "\\$&");
};