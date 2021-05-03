const { Util, MessageEmbed } = require("discord.js");
const sendError = require("../util/error");

module.exports = {
    name: "skip",
    async run (client, message, args) {
        const channel = message.member.voice.channel
        if (!channel)return sendError("You are not in a voice channel!", message.channel);
        const serverQueue = message.client.queue.get(message.guild.id);
        if (!serverQueue)return sendError("I can't skip anything.", message.channel);
        if(!serverQueue.connection)return
        if(!serverQueue.connection.dispatcher)return
        if (serverQueue && !serverQueue.playing) {
        serverQueue.playing = true;
        serverQueue.connection.dispatcher.resume();
        let xd = new MessageEmbed()       
        return message.channel.send("Resume.").catch(err => console.log(err));
        }
        try{
        serverQueue.connection.dispatcher.end()
        } catch (error) {
        serverQueue.voiceChannel.leave()
        message.client.queue.delete(message.guild.id);
        return sendError(`Error: ${error}`, message.channel);
        }
        message.react("✅")
    },
}