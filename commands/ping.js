const client = require('discord.js')
const Discord = require('discord.js')
const usedCommand = new Set()

module.exports = {
    name: 'ping',
    async run(client, message, args) {
        message.delete()
    }
}