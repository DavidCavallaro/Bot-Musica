const { Util, MessageEmbed } = require("discord.js");
const ytdl = require("ytdl-core");
const ytdlDiscord = require("ytdl-core-discord");
const yts = require("yt-search");
const fs = require('fs');
const sendError = require("../util/error")

module.exports = {
  name: "play",
  run: async function (client, message, args) {
    let channel = message.member.voice.channel;
    if (!channel)return sendError("I'm sorry but you need to be in a voice channel to play music!", message.channel);

    const permissions = channel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT"))return sendError("I cannot connect to your voice channel, make sure I have the proper permissions!", message.channel);
    if (!permissions.has("SPEAK"))return sendError("I cannot speak in this voice channel, make sure I have the proper permissions!", message.channel);

    var searchString = args.join(" ");
    if (!searchString)return sendError("You didn't poivide want i want to play", message.channel);
   	const url = args[0] ? args[0].replace(/<(.+)>/g, "$1") : "";
   	var serverQueue = message.client.queue.get(message.guild.id);

    let songInfo = null;
    let song = null;
    if (url.match(/^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/.+$/gi)) {
      try {
        songInfo = await ytdl.getInfo(url)
        if(!songInfo)return sendError("Looks like i was unable to find the song on YouTube", message.channel);
      	song = {
       	id: songInfo.videoDetails.videoId,
       	title: songInfo.videoDetails.title,
       	url: songInfo.videoDetails.video_url,
       	img: songInfo.player_response.videoDetails.thumbnail.thumbnails[0].url
        };
      } catch (error) {
        console.error(error);
        return message.reply(error.message).catch(console.error);
      }
    } else {
      try {
        var searched = await yts.search(searchString);
    	if(searched.videos.length === 0)return sendError("Looks like i was unable to find the song on YouTube", message.channel)
     	songInfo = searched.videos[0]
        song = {
      	id: songInfo.videoId,
      	title: Util.escapeMarkdown(songInfo.title),
      	url: songInfo.url,
      	img: songInfo.image
        };
      } catch (error) {
        	console.error(error);
        	return message.reply(error.message).catch(console.error);
      }
    }
    if (serverQueue) {
     	serverQueue.songs.push(song);
      let thing = new MessageEmbed()
      	.setAuthor("Song has been added to queue.")
      	.setThumbnail(song.img)
      	.setColor("YELLOW")
      	.addField("Name:", song.title, true)
      	.setFooter(`- Service of Chill Castle`)
      return message.channel.send(thing);
    }

    const queueConstruct = {
      textChannel: message.channel,
      voiceChannel: channel,
      connection: null,
      songs: [],
      volume: 80,
      playing: true,
      loop: false
    };
    message.client.queue.set(message.guild.id, queueConstruct);
    queueConstruct.songs.push(song);

    const play = async (song) => {
      const queue = message.client.queue.get(message.guild.id);
    let afk = JSON.parse(fs.readFileSync("./afk.json", "utf8"));
      if (!afk[message.guild.id]) afk[message.guild.id] = {
      afk: false,
    };
 		let stream = null; 
    if (song.url.includes("youtube.com")) {
      stream = await ytdl(song.url);
			stream.on('error', function(er)  {
      if (er) {
        if (queue) {
        queue.songs.shift();
        play(queue.songs[0]);
  	  	return sendError(`An unexpected error has occurred.\nPossible type \`${er}\``, message.channel)
      	}
      }
    	});
		}
    queue.connection.on("disconnect", () => message.client.queue.delete(message.guild.id));
    const dispatcher = queue.connection
      .play(ytdl(song.url, {quality: 'highestaudio', highWaterMark: 1 << 25 ,type: "opus"}))
      .on("finish", () => {
      	const shiffed = queue.songs.shift();
        if (queue.loop === true) {
          queue.songs.push(shiffed);
        };
        play(queue.songs[0])
      })
      dispatcher.setVolumeLogarithmic(queue.volume / 100);
      let thing = new MessageEmbed()
      	.setAuthor("Song has been added to queue.")
      	.setThumbnail(song.img)
      	.setColor("YELLOW") //color
      	.addField("Name:", song.title, true)
      queue.textChannel.send(thing);
    };
    try {
      const connection = await channel.join();
      queueConstruct.connection = connection;
      play(queueConstruct.songs[0]);
    } catch (error) {
      console.error(`I could not join the voice channel: ${error}`);
      message.client.queue.delete(message.guild.id);
      await channel.leave();
      return sendError(`I could not join the voice channel: ${error}`, message.channel);
    }
	},
}
