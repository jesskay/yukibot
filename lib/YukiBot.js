"use strict";

var Discord = require('discord.js');
var jsonfile = require('jsonfile');

var ModuleStorage = require('./lib/moduleStorage.js');

class YukiBot extends Discord.Client {
  constructor() {
    super();

    this.config = jsonfile.readFileSync('./config.json');
    this.creds = jsonfile.readFileSync('./credentials.json');

    this.commands = {};
    this.modules = {"-core":{}};
    this.aliases = {};
    this.handlers = {};

    this.loadCore();
    this.loadModules();
    this.on('disconnected', () => {
    	console.log("Disconnected. Time to die!");
    	process.exit(1);
    });

    this.on('message', msg => {
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
    this.login(this.creds.email, this.creds.password).catch(reason => {
    	console.log("Failed: " + reason);
    });
  }

  loadCore() {
      var coreFunc = require("./modules/mod_core.js");
      coreFunc.call(this, this);
  }

  loadModules() {
  	(this.config['modules'] || []).forEach(moduleName => {
  		try {
  			this.modules[moduleName] = require('./mod_' + moduleName);
  			this.modules[moduleName].name = moduleName;
  			this.modules[moduleName].requirePath = './mod_' + moduleName;
  			var modulizedRegisterCommand = this.registerCommand.bind(this, moduleName);
  			var modulizedRegisterHandler = this.registerHandler.bind(this, moduleName);
        var moduleStorage = new ModuleStorage(moduleName);
  			this.modules[moduleName].load(modulizedRegisterCommand, modulizedRegisterHandler, );
  			console.log("Loaded '" + moduleName + "'");
  		} catch(e) {
  			console.log("Failed to load '" + moduleName + "':");
  			console.log(e);
  		}
  	});
  }

  registerCommand(moduleName, cmdName, cmdAliases, argMode, cmdFunc, desc) {
  	if(modules[moduleName]["commands"]) {
  		this.modules[moduleName].commands.push(cmdName);
  	} else {
  		this.modules[moduleName].commands = [cmdName];
  	}
  	this.commands[cmdName] = cmdFunc;
  	this.commands[cmdName].argMode = argMode;
  	this.commands[cmdName].aliases = cmdAliases;
  	this.commands[cmdName].desc = desc || "";
  	cmdAliases.forEach(alias => this.aliases[alias] = cmdName);
  }

  unregisterCommand(cmdName) {
  	if(!(this.commands[cmdName])) {
  		return;
  	}
  	this.commands[cmdName].aliases.forEach(alias => delete this.aliases[alias]);
  	delete this.commands[cmdName];
  }

  registerHandler(moduleName, handlerType, handlerFunc) {
    if(!this.handlers[handlerType]) {
      this.handlers[handlerType] = [];
    }
    handlerFunc.moduleName = moduleName;
    this.handlers[handlerType].push(handlerFunc);
  }

  unloadModules() {
  	this.handlers = {};
  	Object.keys(this.modules).filter(m => m !== "-core-").forEach(moduleName => {
  		try {
  			this.modules[moduleName].unload();
  		} catch(e) {
  			// do jack shit
  		}
  		if(this.modules[moduleName]["commands"]) {
  			this.modules[moduleName].commands.forEach((cmdName) => {
  				this.unregisterCommand(cmdName);
  			});
  		};
  		delete require.cache[require.resolve(this.modules[moduleName].requirePath)];
  		delete this.modules[moduleName];
  	});
  }
}

module.exports = YukiBot;
