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
	    content: rawParsedCmd[4] || ""
	};

	if(entryType === "quote") { // nasty special case
	    parsedCmd.entryName = api.resolveUserMention(parsedCmd.entryName);
	}

	parsedCmd.entryKey = entryType + "/" + parsedCmd.entryName;

	switch(parsedCmd.cmdName) {
	case "show":
	    if(moduleStorage.getItem(parsedCmd.entryKey) === null) {
		return "!! Nothing there !!";
	    } else {
		var entries = moduleStorage.getItem(parsedCmd.entryKey);
		if(entryType === "quote") { // nasty special case
		    return "<" + parsedCmd.entryName + ">  " + entries[Math.floor(Math.random() * entries.length)];
		} else {
		    return entries[Math.floor(Math.random() * entries.length)];
		}
	    }
	    break;
	case "add":
	    var entries = []
	    if(moduleStorage.getItem(parsedCmd.entryKey) !== null) {
		entries = moduleStorage.getItem(parsedCmd.entryKey);
	    }
	    entries.push(parsedCmd.content);
	    moduleStorage.setItem(parsedCmd.entryKey, entries);
	    return "!! Added !!"
	    break;
	case "list":
	    if(moduleStorage.getItem(parsedCmd.entryKey) === null) {
		return "!! Nothing there !!";
	    } else {
		var entries = moduleStorage.getItem(parsedCmd.entryKey);
		if(entryType === "quote") { // nasty special case
		    return entries.map(q => "<" + parsedCmd.entryName + ">  " + q).join("\n");
		} else {
		    return entries.join("\n");
		}
	    }
	    break;
	case "kill":
	    if(!api.userIsAdmin) {
		return "Nope."
	    }
	    var entries = []
	    if(moduleStorage.getItem(parsedCmd.entryKey) !== null) {
		entries = moduleStorage.getItem(parsedCmd.entryKey);
	    }
	    if(entries.length > 0) {
		var removedEntry = entries.pop();
		moduleStorage.setItem(parsedCmd.entryKey, entries);
		return ("!! Killed '" + removedEntry + "' !!");
	    } else {
		return "!! Nothing to remove !!";
	    }
	    break;
	}
    };
    
    registerCommand('quote', ['q'], 'raw', (api, argStr) => {
	api.say("```\n" + retrieveEntry("quote", api, argStr) + "\n```");
    }, ["quote <user>: Show a random quote from a particular user.",
	"quote show <user>: As above.",
//	"quote: Show a random quote from a random user.",
	"quote add <user> <quote>: Add a quote for a particular user.",
	"quote list <user>: Show all stored quotes for a particular user.",
	"quote kill <user>: Remove the last quote added [admin only]."].join("\n"));

    registerCommand('db', [], 'raw', (api, argStr) => {
	api.reply(retrieveEntry("db", api, argStr));
    }, ["db <topic>: Show a random entry from a particular topic.",
	"db show <topic>: As above.",
	"db add <topic> <content>: Add an entry for a particular topic.",
	"db list <topic>: Show all stored entries for a particular topic.",
	"db kill <topic>: Remove the last entry added [admin only]."].join("\n"));
};

exports["unload"] = () => {};
