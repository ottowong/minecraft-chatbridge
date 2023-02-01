require('dotenv').config()
const { utils } = require('aes-js')
const mineflayer = require('mineflayer')
//const mineflayerViewer = require("prismarine-viewer").mineflayer

let lastCommand = new Date();

console.log("Trying to Join "+process.env.host+":"+process.env.port)
var options = {
  host: process.env.host, // optional
  port: process.env.port,       // optional
  username: process.env.mcEmail, // email and password are required only for
  password: process.env.mcPassword,          // online-mode=true servers
  version: process.env.version,                 // false corresponds to auto version detection (that's the default), put for example "1.8.8" if you need a specific version
  auth: process.env.auth      // optional; by default uses mojang, if using a microsoft account, set to 'microsoft'
}

var bot = mineflayer.createBot(options);

bindEvents(bot);

bot.commands = {}
// load commands
const commands = require("./commands.js")
commands["command"](bot)
// load discord plugin
const discordPlugin = require("./discord.js")
discordPlugin["plugin"](bot)

//bot.once("spawn", () => {
//    mineflayerViewer(bot, { port: 9001, firstperson: true })
//})


//console.log(bot.commands)

function dadBot(message, leng)
{
	message = message.toString()
	message = message.slice(0,150 - (11 + bot.username.length))
      	return(">Hi, " + message.slice(leng) + ", I'm " + bot.username)
}

function formatDate()
{
	let current = new Date();
	let cDate = current.getFullYear() + '-' + (current.getMonth() + 1) + '-' + current.getDate();
	let cTime = current.getHours() + ":" + current.getMinutes() + ":" + current.getSeconds();
	let dateTime = cDate + ' ' + cTime;
	return(dateTime);
}


function bindEvents(bot){

  bot.on('chat', function (username, message) {
    // ignore messages from itself
    // if (username === bot.username) return
    // ignore anyone whispering to the bot
    if(username === "whispers") return
    // console.log(message.toString())
    // check if the message starts with the prefix

    try{
      if((message.startsWith(process.env.prefix) && bot.commands[message.substr(1).split(" ")[0]]) || message.toLowerCase().startsWith("i'm ") || message.toLowerCase().startsWith("im "))
      {
	console.log("command detected.")
	console.log
        if((Date.now() - lastCommand) < (1000 * 1.5)) // n seconds
        {
	  console.log("commands firing too quick!")
          lastCommand = Date.now()
          return
        }
        lastCommand = Date.now()
      }
    } catch { return }

    if(message.startsWith(process.env.prefix)){
      const fullmessage = message.toLowerCase()
      const args = message.substr(1).split(" ")
      // check if the command exists
      if(bot.commands[args[0]]){
	  console.log("<"+username+"> "+message)
          bot.commands[args[0]](args, fullmessage, username)
      }
    }
    if(message.toLowerCase().startsWith("i'm "))
    {
//      bot.chat(">Hi, " + message.slice(4) + ", I'm " + bot.username)
      bot.chat(dadBot(message, 4))
    }
    else if(message.toLowerCase().startsWith("im ")) // I'm too lazy to make this one if statement
    {
//      bot.chat(">Hi, " + message.slice(3) + ", I'm " + bot.username)
      bot.chat(dadBot(message, 3))
    }
  })

  // Log errors and kick reasons:
  bot.on('login', () => {

//    setInterval(() => {
//      bot.chat("spam")
//    }, 20000)

    console.log("Joined Server Successfully.", formatDate())
  });
  bot.on('kicked', function(reason, loggedIn) {
    console.log(reason, formatDate())
    process.exit(1)
  });
  bot.on('error', function(err){
    console.log(err, formatDate())
    process.exit(1)
  });
//  bot.on('error', err => console.log("Unable to join server: ", err, formatDate()));
  bot.on('end', function(){
    process.exit(0)
  });
}
