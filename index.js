var discord = require('discord.js');
var jsonfile = require('jsonfile');

var config = jsonfile.readFileSync('./config.json');
var creds = jsonfile.readFileSync('./credentials.json');

var c = new discord.Client();

var commands = {};
var aliases = {};
var modules = {};

var registerCommand = (cmdName, cmdAliases, argMode, cmdFunc, desc) => {
    commands[cmdName] = cmdFunc;
    commands[cmdName].argMode = argMode;
    commands[cmdName].aliases = cmdAliases;
    commands[cmdName].desc = desc || "";
    cmdAliases.forEach(alias => aliases[alias] = cmdName);
};

var unregisterCommand = cmdName => {
    commands[cmdName].aliases.forEach(alias => delete aliases[alias]);
    delete commands[cmdName];
};

var loadModules = () => {
    (config['modules'] || []).forEach(moduleName => {
	try {
	    modules[moduleName] = require('./mod_' + moduleName);
	    modules[moduleName].name = moduleName;
	    modules[moduleName].requirePath = './mod_' + moduleName;
	    modules[moduleName].load(registerCommand);
	    console.log("Loaded '" + moduleName + "'");
	} catch(e) {
	    console.log("Failed to load '" + moduleName + "':");
	    console.log(e);
	}
    });
};

var unloadModules = () => {
    Object.keys(modules).forEach(moduleName => {
	modules[moduleName].unload(unregisterCommand);
	delete require.cache[require.resolve(modules[moduleName].requirePath)];
	delete modules[moduleName];
    });
};

registerCommand('reload', [], '', (api) => {
    if(api.userIsAdmin) {
	unloadModules();
	config = jsonfile.readFileSync('./config.json');
	loadModules();
	console.log("Reloaded!");
    } else {
	api.reply("I don't think so, nya~");
    }
}, "reload: Reload all modules [admin only].");

registerCommand('restart', ['goodbye', 'bye', 'quit'], '', (api) => {
    if(api.userIsAdmin) {
	console.log("Bye!");
	c.logout().then(process.exit);
    } else {
	api.reply("Can't stop the bot~");
    }
}, "restart: Fully restart the bot [admin only].");

registerCommand('join', [], 'raw',(api, argStr) => {
    if(api.userIsAdmin) {
	c.joinServer(argStr).catch(reason => {
	    api.reply("Uh oh.");
	    console.log('Join failed: ' + reason);
	});
    } else {
	api.reply("I don't think so, nya~");
    }
}, "join <invite>: Join another server using instant invite URL [admin only].");

registerCommand('help', ['?'], 'raw', (api, argStr) => {
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
	    
	    api.reply(helpMsg.join('\n'));
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

	api.reply(helpMsg.join('\n'));
    }
}, "help: Shows help for this bot's commands. You're seeing it right now!");

loadModules();

c.on('message', msg => {
    if(msg.author.id !== c.user.id && msg.content !== '') {
	var tokens = msg.content.split(' ');
	if(tokens[0] === '<@' + c.user.id + '>') {
	    var argStr = tokens.slice(2).join(' ');
	    var cmd = tokens[1].toLowerCase();
	} else if(tokens[0][0] === '!') {
	    var argStr = tokens.slice(1).join(' ');
	    var cmd = tokens[0].slice(1).toLowerCase();
	} else {
	    return;
	}

	if(aliases.hasOwnProperty(cmd)) {
	    cmd = aliases[cmd];
	}

	var clientApi = {
	    'reply': replyMsg => {
		if(msg.channel instanceof discord.PMChannel) {
		    c.sendMessage(msg.channel, replyMsg);
		} else {
		    c.sendMessage(msg.channel, '<@' + msg.author.id + '> ' + replyMsg);
		}
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
	} else if(msg.channel instanceof discord.PMChannel) {
	    c.sendMessage(msg.channel, "No such command, sorry!");
	}
    }
});

c.login(creds.email, creds.password).catch(reason => {
    console.log("Failed: " + reason);
});
