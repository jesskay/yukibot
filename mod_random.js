var randomChoice = (choices) => {
    return choices[Math.floor(Math.random() * choices.length)];
};

exports['load'] = (registerCommand) => {
    registerCommand('roll', ['dice'], 'words', (api, args) => {
	var rolls = [];
	args.forEach(dice => {
	    if(!(isNaN(parseInt(dice)))){
		rolls.push(Math.floor(Math.random() * parseInt(dice)) + 1);
	    };
	});
	if(rolls.length === 0) {
	    rolls = [Math.floor(Math.random() * 6) + 1];
	}
	
	api.reply(rolls.map(x => x.toString()).join(', '));
    }, "roll [<N>...]: Rolls one or more dice with N sides (default 6).");
    
    registerCommand('flip', ['coin'], 'raw', (api, argStr) => {
	var count = 1;
	if(!(isNaN(parseInt(argStr)))) {
	    count = parseInt(argStr);
	}
	
	var flips = [];
	for(var i = 0; i < count; i++) {
	    if(Math.random() >= 0.5) {
		flips.push('heads');
	    } else {
		flips.push('tails');
	    }
	}
	
	api.reply(flips.join(', '));
    }, "flip [N]: Flips N coins (default 1).");
    
    registerCommand('choice', ['choose'], 'commas', (api, args) => {
	if(args.length <= 1) {
	    api.reply("That's not even a choice, silly.");
	} else {
	    api.reply(randomChoice(args));
	}
    }, "choice <comma-separated options>: Choose between a number of different options.");

    registerCommand('8ball', ['8-ball'], '', (api) => {
	api.reply(randomChoice([
	    "It is certain.", "It is decidedly so.", "Without a doubt.", "Yes, definitely.",
	    "You may rely on it.", "As I see it, yes.", "Most likely.", "Outlook good.",
	    "Yes.", "Signs point to yes.", "Reply hazy, try again.", "Ask again later.",
	    "Better not tell you now.", "Cannot predict now.", "Concentrate and ask again.",
	    "Don't count on it.", "My reply is no.", "My sources say no.",
	    "Outlook not so good.", "Very doubtful."
	]));
    }, "8ball <question>: Consult the wisdom of the magic 8 ball.");

    registerCommand('grey', ['grey-scale', 'anal'], '', (api) => {
	api.reply(randomChoice([
	    "Bend over.", "Fuck off.", "Suck my dick.", "No.", "Ugh.",
	    "*Slaps you with his dick.*", "I'll fuck you later.", "Anal."
	]));
    }, "grey <question>: Consult the wisdom of... Grey Scale?");

    registerCommand('flaxx', ['slut'], '', (api) => {
	api.reply(randomChoice([
	    "Please fuck my throat", "Can I suck your balls, please?", "*bends over*",
	    "*spreads buttcheeks*", "*opens mouth*", "Absolutely!", "Uh... No?",
	    "I could so go for a glass of cum right now.", "*idly sucks dick*"
	]));
    }, "flaxx <question>: Consult the \"wisdom\" of Flaxx.");
};

exports['unload'] = () => {};
