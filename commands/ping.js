const client = require('discord.js')
const Discord = require('discord.js')
const usedCommand = new Set()

module.exports = {
    name: 'ping',
    async run(client, message, args) {
        message.delete()
        message.channel.send('Ping...').then(sent => {sent.edit(`This is my ping: ${client.ws.ping}ms`).then(message => message.delete({timeout:5000}))
    })
    }
}