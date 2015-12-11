module.exports = function(bot) {
  bot.registerCommand('-core-', 'reload', [], '', (api) => {
  	if(api.userIsAdmin) {
  		bot.unloadModules();
  		bot.config = jsonfile.readFileSync('./config.json');
  		bot.loadModules();
  		console.log("Reloaded!");
  	} else {
  		api.reply("I don't think so, nya~");
  	}
  }, "reload: Reload all modules [admin only].");

  bot.registerCommand('-core-', 'restart', ['goodbye', 'bye', 'quit'], '', (api) => {
  	if(api.userIsAdmin) {
  		console.log("Bye!");
  		bot.logout().then(process.exit);
  	} else {
  		api.reply("Can't stop the bot~");
  	}
  }, "restart: Fully restart the bot [admin only].");

  bot.registerCommand('-core-', 'join', [], 'raw', (api, argStr) => {
  	if(api.userIsAdmin) {
  		bot.joinServer(argStr).catch(reason => {
  			api.reply("Uh oh.");
  			console.log('Join failed: ' + reason);
  		});
  	} else {
  		api.reply("I don't think so, nya~");
  	}
  }, "join <invite>: Join another server using instant invite URL [admin only].");

  bot.registerCommand('-core-', 'help', ['?'], 'raw', (api, argStr) => {
  	if(argStr.length > 0) {
  		if(aliases[argStr.toLowerCase()]) {
  			var cmd = bot.commands[aliases[argStr.toLowerCase()]];
  		} else {
  			var cmd = bot.commands[argStr.toLowerCase()];
  		}

  		if(cmd) {
  			var helpMsg = ["```"];

  			if(cmd.desc.length > 0) {
  				helpMsg.push(cmd.desc);
  			} else {
  				helpMsg.push("Jess didn't write any help for this command yet, go bug her.");
  			}

  			if(cmd.aliases.length > 0) {
  				helpMsg.push("(aliases: " + cmd.aliases.join(', ') + ")");
  			}

  			helpMsg.push("```");

  			api.say(helpMsg.join('\n'));
  		} else {
  			api.reply("Sorry, I don't think I've heard of that command. :<")
  		}
  	} else {
  		helpMsg = ["Nya~ I know the following commands right now:"];
  		Object.keys(commands).forEach(cmdName => {
  			helpMsg.push("```");
  			if(commands[cmdName].desc.length > 0) {
  				helpMsg.push(commands[cmdName].desc);
  			} else {
  				helpMsg.push(cmdName + ": no help available right now");
  			}

  			if(commands[cmdName].aliases.length > 0) {
  				helpMsg.push("(aliases: " + commands[cmdName].aliases.join(', ') + ")");
  			}
  			helpMsg.push("```");
  		});

  		api.say(helpMsg.join('\n'));
  	}
  }, "help: Shows help for this bot's commands. You're seeing it right now!");
}
