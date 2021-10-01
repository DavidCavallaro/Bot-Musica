const fs = require("fs");
const { Collection, Client } = require("discord.js");
const { RichEmbed  } = require('discord.js');

const client = new Client();
client.commands = new Collection();
client.queue = new Map()
client.config = {
	prefix: 'your_prefix' //Set your prefix
}

fs.readdir(__dirname + "/events/", (err, files) => {
  if (err) return console.error(err);
  files.forEach((file) => {
    const event = require(__dirname + `/events/${file}`);
    let eventName = file.split(".")[0];
    client.on(eventName, event.bind(null, client));
    console.log("Evento caricato: "+eventName)
  });
});

fs.readdir("./commands/", (err, files) => {
  if (err) return console.error(err);
  files.forEach((file) => {
    if (!file.endsWith(".js")) return;
    let props = require(`./commands/${file}`);
    let commandName = file.split(".")[0];
    client.commands.set(commandName, props);
    console.log("Comando caricato: "+commandName)
  });
});

const keepAlive = require('./server.js'); // online 24/7 with uptimerobot.com
keepAlive();

client.login('your_token') //Set your token
