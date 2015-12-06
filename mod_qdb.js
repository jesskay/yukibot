exports["load"] = (registerCommand, moduleStorage) => {
    var commandsRegex = /^(show|add|list|kill)\s+([^\s]*)(\s(.*))?/;

    var retrieveEntry = (entryType, api, argStr) => {
	if(argStr.match(commandsRegex) === null) {
	    argStr = "show " + argStr;
	}
	
	var rawParsedCmd = argStr.match(commandsRegex);
	var parsedCmd = {
	    cmdName: rawParsedCmd[1],
	    entryName: rawParsedCmd[2],
	    content: (rawParsedCmd[4] || "").replace(/\s*```\s*/, "")
	};

	var hops = 0;
	while(moduleStorage.getItem("alias/" + parsedCmd.entryName.toLowerCase()) !== null) {
	    parsedCmd.entryName = moduleStorage.getItem("alias/" + parsedCmd.entryName.toLowerCase());
	    hops = hops + 1;
	    if(hops == 10) {
		api.reply("TOO MUCH RECURSION, FUCK YOU!");
		break;
	    }
	}

	var quotedUser = null;

	if(entryType === "quote") { // nasty special case
	    quotedUser = api.resolveUserMention(parsedCmd.entryName);
	    parsedCmd.entryName = quotedUser.idOrFallback;
	}

	parsedCmd.entryKey = entryType + "/" + parsedCmd.entryName.toLowerCase();

	switch(parsedCmd.cmdName) {
	case "show":
	    if(moduleStorage.getItem(parsedCmd.entryKey) === null) {
		api.reply("Nothing there!");
	    } else {
		var entries = moduleStorage.getItem(parsedCmd.entryKey);
		api.say("```\n" + entries[Math.floor(Math.random() * entries.length)] + "\n```");
	    }
	    break;
	case "add":
	    var entries = []
	    if(moduleStorage.getItem(parsedCmd.entryKey) !== null) {
		entries = moduleStorage.getItem(parsedCmd.entryKey);
	    }
	    if(entryType === "quote") { // nasty special case
		entries.push("<" + quotedUser.username + "> " + parsedCmd.content);
	    } else {
		entries.push(parsedCmd.content);
	    }
	    moduleStorage.setItem(parsedCmd.entryKey, entries);
	    api.reply("Added!");
	    break;
	case "list":
	    if(moduleStorage.getItem(parsedCmd.entryKey) === null) {
		api.reply("Nothing there!");
	    } else {
		var entries = moduleStorage.getItem(parsedCmd.entryKey);
		api.say("```\n" + entries.join("\n") + "\n```");
	    }
	    break;
	case "kill":
	    if(!api.userIsAdmin) {
		api.reply("Nope.");
		return;
	    }
	    var entries = []
	    if(moduleStorage.getItem(parsedCmd.entryKey) !== null) {
		entries = moduleStorage.getItem(parsedCmd.entryKey);
	    }
	    if(entries.length > 0) {
		var removedEntry = entries.pop();
		if(entries.length === 0) {
		    moduleStorage.removeItem(parsedCmd.entryKey);
		} else {
		    moduleStorage.setItem(parsedCmd.entryKey, entries);
		}
		api.reply("Killed `" + removedEntry + "`");
	    } else {
		api.reply("Nothing to remove.");
	    }
	    break;
	}
    };
    
    registerCommand('quote', ['q'], 'raw', (api, argStr) => {
	retrieveEntry("quote", api, argStr);
    }, ["quote <user>: Show a random quote from a particular user.",
	"quote show <user>: As above.",
//	"quote: Show a random quote from a random user.",
	"quote add <user> <quote>: Add a quote for a particular user.",
	"quote list <user>: Show all stored quotes for a particular user.",
	"quote kill <user>: Remove the last quote added [admin only]."].join("\n"));

    registerCommand('db', [], 'raw', (api, argStr) => {
	retrieveEntry("db", api, argStr);
    }, ["db <topic>: Show a random entry from a particular topic.",
	"db show <topic>: As above.",
	"db add <topic> <content>: Add an entry for a particular topic.",
	"db list <topic>: Show all stored entries for a particular topic.",
	"db kill <topic>: Remove the last entry added [admin only]."].join("\n"));

    registerCommand('quote-alias', ['qalias'], 'words', (api, args) => {
	if(args.length !== 2) {
	    api.reply("Stop being bad.");
	} else {
	    moduleStorage.setItem("alias/" + args[0].toLowerCase(), api.resolveUserMention(args[1]).idOrFallback);
	    api.reply("Aliased.");
	}
    }, "quote-alias <alias> <user>: Add an alias for a user.");

    registerCommand('quote-unalias', ['qunalias'], 'words', (api, args) => {
	if(args.length !== 1) {
	    api.reply("Stop being bad.");
	} else {
	    moduleStorage.removeItem("alias/" + args[0].toLowerCase());
	    api.reply("Unaliased.");
	}
    },"quote-unalias <alias>: Remove an alias.");
};

exports["unload"] = () => {};
