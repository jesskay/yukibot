var vm = require('vm');
var util = require('util');
var jsonfile = require('jsonfile');

exports["load"] = (bot) => {
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

	bot.registerCommand('-core-', 'js', ['!'], 'raw', (api, argStr) => {
		try {
			api.reply(util.inspect(vm.runInNewContext(argStr, {}, {timeout: 10000})));
		} catch(e) {
			api.reply(e.toString());
		}
	}, "Run arbitrary Javascript code and reply with the result. Will fail if execution time exceeds 10 seconds.");

	var persistentContext = vm.createContext({});
	
	bot.registerCommand('-core-', 'js-persist', ['jsp', '>'], 'raw', (api, argStr) => {
		try {
			api.reply(util.inspect(vm.runInContext(argStr, persistentContext, {timeout: 10000})));
		} catch(e) {
			api.reply(e.toString());
		}
	}, "Run arbitrary Javascript code in a persistent environment, and reply with the result. Will fail if execution time exceeds 10 seconds.");

	bot.registerCommand('-core-', 'js-unpersist', ['jsup', '<'], '', (api) => {
		persistentContext = vm.createContext({});
		api.reply("Reset!");
	}, "Resets the environment used by !js-persist to original state.");

  bot.registerCommand('-core-', 'help', ['?'], 'raw', (api, argStr) => {
  	if(argStr.length > 0) {
  		if(bot.aliases[argStr.toLowerCase()]) {
  			var cmd = bot.commands[bot.aliases[argStr.toLowerCase()]];
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
  		Object.keys(bot.commands).forEach(cmdName => {
  			helpMsg.push("```");
  			if(bot.commands[cmdName].desc.length > 0) {
  				helpMsg.push(bot.commands[cmdName].desc);
  			} else {
  				helpMsg.push(cmdName + ": no help available right now");
  			}

  			if(bot.commands[cmdName].aliases.length > 0) {
  				helpMsg.push("(aliases: " + bot.commands[cmdName].aliases.join(', ') + ")");
  			}
  			helpMsg.push("```");
  		});

  		var helpStr = "";
      		var MAX_MSG_LENGTH = 2000;
      		for(var i = 0; i <= helpMsg.length; i++) {
        		if(i === helpMsg.length) {
        	 		api.say(helpStr.slice(1));
          			break;
        		}

        		if((helpStr.length + helpMsg[i].length) >= MAX_MSG_LENGTH) {
          			api.say(helpStr.slice(1)); // drops the starting \n so we can be lazy and have it also help us avoid a +1 in the length test
          			helpStr = "";
        		}

        		helpStr += "\n" + helpMsg[i];
		}
  	}
  }, "help: Shows help for this bot's commands. You're seeing it right now!");
}
