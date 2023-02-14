const http = require('http');
const https = require('https');

const Discord = require("discord.js");
const client = new Discord.Client();

var requestify = require('requestify');


['SIGINT', 'SIGTERM', 'SIGQUIT']
  .forEach(signal => process.on(signal, () => {

    const channel = client.channels.cache.get(process.env.discordChannel);
    var sigEmbed = new Discord.MessageEmbed()
	.setColor(0xFF0000)
	.setDescription(signal)
    channel.send({ embed: sigEmbed });

    setTimeout(() => { // shit code, wait 1 second before exiting on sigint/term/quit
      process.exit();
    }, 1000)
  }));


module.exports.plugin = (bot) => {
    
    // login
    client.login(process.env.discordToken).then(() => {
        console.log("Logged in as: "+client.user.tag);
    });

	bot.once('spawn', function () {
		setInterval(() =>{
			const channel = client.channels.cache.get("1070429881743196252");
			var playerList = Object.keys(bot.players)
			let currentDate = new Date
			var playersStr ="**Last Updated: " + currentDate.toDateString() + "**\n"
			playerList.forEach(item => {
				item = item.replace(/\\(\*|_|`|~|\\)/g, '$1');
				item = item.replace(/(\*|_|`|~|\\)/g, '\\$1');
				playersStr += item + "\n"
			})
			//console.log(playersStr)
			channel.messages.fetch("1072131825247461457")
			.then(message => message.edit(playersStr))
		}, 10000)
	})

	bot.on('playerJoined', function (player) {
	})

    // when a message is sent to minecraft
    bot.on('chat', function (username, message, translate, jsonMsg, matches) {
        const channel = client.channels.cache.get(process.env.discordChannel);
	console.log("<"+username+"> : "+message)
	console.log(jsonMsg)
	try
	{
		var uuid = bot.players[username].uuid
		var chatEmbed = new Discord.MessageEmbed()
			.setColor(0xFFFFFF)
	        	.setAuthor(username, 'https://crafatar.com/avatars/'+uuid )
	            	.setDescription(message+" ")
	}
	catch(error)
	{
		var chatEmbed = new Discord.MessageEmbed()
                        .setColor(0x0099FF)                        
			.setAuthor(username)
                        .setDescription(message+" ")
	}
	if (message.startsWith(">"))
	{
		chatEmbed.setColor(0x00FF00)
	}
	if (username.toLowerCase() == bot.username.toLowerCase())
	{
		chatEmbed.setColor(0x0000FF)
	}
	try
	{
		if(jsonMsg.extra[0].json) //whisper
		{
			chatEmbed.setColor(0xFF33DD)
			chatEmbed.setDescription(message.substring(message.indexOf(":") + 1 ))
		}
	}
	catch(error)
	{
	}
	channel.send({ embed: chatEmbed });
	
        //channel.send("**<"+username+">** "+message)
    })

	bot.on('message', function (jsonMsg, position, sender, verified) {
		const channel = client.channels.cache.get(process.env.discordChannel);
		try{
			if(jsonMsg.extra[0].color == "light_purple"){return} // ignore whisper
			//console.log(jsonMsg.extra[0].json)
			//console.log("whisper")
			//console.log(jsonMsg)
			var whisperStr = ""
			for (let i = 0; i < jsonMsg.extra.length; i++)
			{
				whisperStr = whisperStr + jsonMsg.extra[i]
			}
			console.log(whisperStr)

			whisperEmbed = new Discord.MessageEmbed()
                                .setColor(0x00989b)
                                .setDescription(whisperStr)
                        channel.send({ embed: whisperEmbed })
			return;

		} catch {
			
		}

		//console.log(bot.players.username)


		//console.log(playerList)
		//console.log(position)
		//console.log(jsonMsg.text)
		if(position == "system" && jsonMsg.text){
			try{
			//console.log(jsonMsg.text)
			systemEmbed = new Discord.MessageEmbed()
				.setColor(0x838383)
				.setDescription(jsonMsg.text)
			channel.send({ embed: systemEmbed });
			} catch {

			}
		} else {
			//console.log(sender)
			//console.log(jsonMsg)
			//console.log()
		}
	});
	bot.on('error', function(err){
		const channel = client.channels.cache.get(process.env.discordChannel);
                errorEmbed = new Discord.MessageEmbed()
                        .setColor(0xFF0000)
                        .setDescription(err)
                channel.send({ embed: errorEmbed });
		setTimeout(() => {
			process.exit(1)
		}, 1000)
    	})

	bot.on('kicked', function(reason, loggedIn) {
		const channel = client.channels.cache.get(process.env.discordChannel);
		kickedEmbed = new Discord.MessageEmbed()
                	.setColor(0xFF0000)
                       	.setDescription(reason)
		channel.send({ embed: kickedEmbed });
		setTimeout(() => {
			process.exit(1)
		}, 1000)
	});

	bot.on('end', function() {
		const channel = client.channels.cache.get(process.env.discordChannel);
		kickedEmbed = new Discord.MessageEmbed()
                	.setColor(0xFF0000)
                       	.setDescription("end")
		channel.send({ embed: kickedEmbed });
		setTimeout(() => {
			process.exit(0)
		}, 1000)
	});

    // when a message is sent to discord
    client.on("message", msg => {
        // ignore message not in the correct channel
        if(msg.channel.id !== process.env.discordChannel) 
	{
        	if(msg.channel.id == process.env.discordAdminChannel) 
		{
			bot.chat((msg.content).slice(0,239));
			msg.react("<:verified:1073358388676792390>")
			//msg.delete()
			return;
		}
		else
		{
			return;
		}
	}
        // ignore the bot's own messages
        if(msg.author.id === client.user.id) return;
        // if message starts with the prefix, don't show the username so discord users can use commands
        if(msg.content.startsWith(process.env.prefix)){
            // anon command
            if(msg.content.startsWith(process.env.prefix+"a ")){
		if (process.env.admins.includes(msg.author.id))
		{
	                bot.chat(msg.content.substr(3));
		} 
		else 
		{ 
			return 
		}
            } else if(msg.content.startsWith(process.env.prefix+"w ")) {
                var msgargs = msg.content.substr(1).split(" ")
                bot.chat("/w "+ msgargs[1]+msg.content.substr(msgargs[1].length + 3))
            } else {
                bot.chat(msg.content);
            }
        } else {
            bot.chat((msg.author.tag+": "+msg.content).slice(0,239));
	    return;
        }
        console.log((msg.author.tag+": "+msg.content).slice(0,239));
    });   
}
