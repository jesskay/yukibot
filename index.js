"use strict";

var discord = require('discord.js');
var jsonfile = require('jsonfile');

var config = jsonfile.readFileSync('./config.json');
var creds = jsonfile.readFileSync('./credentials.json');

var c = new discord.Client();

var commands = {};
var aliases = {};
var modules = {
	"-core-": {}
};
var handlers = {};

var registerCommand = (moduleName, cmdName, cmdAliases, argMode, cmdFunc, desc) => {
	if(modules[moduleName]["commands"]) {
		modules[moduleName].commands.push(cmdName);
	} else {
		modules[moduleName].commands = [cmdName];
	}
	commands[cmdName] = cmdFunc;
	commands[cmdName].argMode = argMode;
	commands[cmdName].aliases = cmdAliases;
	commands[cmdName].desc = desc || "";
	cmdAliases.forEach(alias => aliases[alias] = cmdName);
};

var unregisterCommand = cmdName => {
	if(!(commands[cmdName])) {
		return;
	}
	commands[cmdName].aliases.forEach(alias => delete aliases[alias]);
	delete commands[cmdName];
};

class ModuleStorage {
	constructor(moduleName) {
		this._moduleName = moduleName;
		this._fileName = "./storage_" + moduleName + ".json";
		this._loadData();
	}

	_loadData() {
		try {
			this._data = jsonfile.readFileSync(this._fileName);
		} catch(e) {
			console.log("warning: couldn't load storage for '" + this._moduleName + "':");
			console.log(e);
			this._data = {};
		}

		this.length = Object.keys(this).length;
	}

	_saveData() {
		try {
			jsonfile.writeFileSync(this._fileName, this._data);
		} catch(e) {
			console.log("warning: couldn't save storage for '" + this._moduleName + "':");
			console.log(e);
		}
	}

	key(n) {
		return Object.keys(this)[n];
	}

	getItem(k) {
		return this._data[k] || null;
	}

	setItem(k, v) {
		this._data[k] = v;
		this._saveData();
	}

	removeItem(k) {
		delete this._data[k];
		this._saveData();
	}

	clear() {
		this._data = {};
		this._saveData();
	}
}

var loadModules = () => {
	(config['modules'] || []).forEach(moduleName => {
		try {
			modules[moduleName] = require('./mod_' + moduleName);
			modules[moduleName].name = moduleName;
			modules[moduleName].requirePath = './mod_' + moduleName;
			var modulizedRegisterCommand = (cmdName, cmdAliases, argMode, cmdFunc, desc) => {
				registerCommand(moduleName, cmdName, cmdAliases, argMode, cmdFunc, desc);
			};
			var modulizedRegisterHandler = (handlerType, handlerFunc) => {
				if(!handlers[handlerType]) {
					handlers[handlerType] = [];
				}
				handlerFunc.moduleName = moduleName;
				handlers[handlerType].push(handlerFunc);
			};
			modules[moduleName].load(modulizedRegisterCommand, modulizedRegisterHandler, new ModuleStorage(moduleName));
			console.log("Loaded '" + moduleName + "'");
		} catch(e) {
			console.log("Failed to load '" + moduleName + "':");
			console.log(e);
		}
	});
};

var unloadModules = () => {
	handlers = {};
	Object.keys(modules).filter(m => m !== "-core-").forEach(moduleName => {
		try {
			modules[moduleName].unload();
		} catch(e) {
			// do jack shit
		}
		if(modules[moduleName]["commands"]) {
			modules[moduleName].commands.forEach((cmdName) => {
				unregisterCommand(cmdName);
			});
		};
		delete require.cache[require.resolve(modules[moduleName].requirePath)];
		delete modules[moduleName];
	});
};

registerCommand('-core-', 'reload', [], '', (api) => {
	if(api.userIsAdmin) {
		unloadModules();
		config = jsonfile.readFileSync('./config.json');
		loadModules();
		console.log("Reloaded!");
	} else {
		api.reply("I don't think so, nya~");
	}
}, "reload: Reload all modules [admin only].");

registerCommand('-core-', 'restart', ['goodbye', 'bye', 'quit'], '', (api) => {
	if(api.userIsAdmin) {
		console.log("Bye!");
		c.logout().then(process.exit);
	} else {
		api.reply("Can't stop the bot~");
	}
}, "restart: Fully restart the bot [admin only].");

registerCommand('-core-', 'join', [], 'raw', (api, argStr) => {
	if(api.userIsAdmin) {
		c.joinServer(argStr).catch(reason => {
			api.reply("Uh oh.");
			console.log('Join failed: ' + reason);
		});
	} else {
		api.reply("I don't think so, nya~");
	}
}, "join <invite>: Join another server using instant invite URL [admin only].");

registerCommand('-core-', 'help', ['?'], 'raw', (api, argStr) => {
	if(argStr.length > 0) {
		if(aliases[argStr.toLowerCase()]) {
			var cmd = commands[aliases[argStr.toLowerCase()]];
		} else {
			var cmd = commands[argStr.toLowerCase()];
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

loadModules();

c.on('disconnected', () => {
	console.log("Disconnected. Time to die!");
	process.exit(1);
});

c.on('message', msg => {
	if(msg.author.id !== c.user.id && msg.content !== '') {
		var tokens = msg.content.split(' ');
		var cmd = null;
		if(tokens[0] === '<@' + c.user.id + '>') {
			var argStr = tokens.slice(2).join(' ');
			var cmd = tokens[1].toLowerCase();
		} else if(tokens[0][0] === '!') {
			var argStr = tokens.slice(1).join(' ');
			var cmd = tokens[0].slice(1).toLowerCase();
		}

		if(aliases.hasOwnProperty(cmd)) {
			cmd = aliases[cmd];
		}

		var clientApi = {
			'resolveUserMention': userStr => {
				var user = null;
				if(userStr.match(/^<@\d+>/)) {
					user = c.users.get('id', userStr.slice(2, -1));
				} else {
					if(userStr.match(/@.*/))
						userStr = userStr.slice(1);
					user = c.users.filter(user => user.username.toLowerCase() === userStr.toLowerCase())[0];
				}

				if(user) {
					return {
						idOrFallback: "<@" + user.id + ">",
						username: user.username
					};
				} else {
					return {
						idOrFallback: userStr,
						username: userStr
					};
				}
			},
			'reply': replyMsg => {
				if(msg.channel instanceof discord.PMChannel) {
					c.sendMessage(msg.channel, replyMsg);
				} else {
					c.sendMessage(msg.channel, '<@' + msg.author.id + '> ' + replyMsg);
				}
			},
			'say': sayMsg => {
				c.sendMessage(msg.channel, sayMsg);
			},
			'userIsAdmin': (config['adminIds'] || []).indexOf(msg.author.id) >= 0
		};

		if(commands[cmd] instanceof Function) {
			if(commands[cmd].argMode === 'raw') {
				commands[cmd](clientApi, argStr);
			} else if(commands[cmd].argMode === 'commas') {
				var args = argStr.split(/\s*,+\s*/);
				commands[cmd](clientApi, args);
			} else if(commands[cmd].argMode === 'words') {
				var args = argStr.split(/[\s,]+/);
				commands[cmd](clientApi, args);
			} else {
				var args = argStr.split(/\s+/);
				commands[cmd](clientApi, args);
			}
		} else if(handlers["message"]) {
			for(var i = 0; i < handlers["message"].length; i++) {
				if(handlers["message"][i](clientApi, msg.content))
					break; // stop trying handlers on a truthy return/
			}
		}
	}
});

c.login(creds.email, creds.password).catch(reason => {
	console.log("Failed: " + reason);
});
