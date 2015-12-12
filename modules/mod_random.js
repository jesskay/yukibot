var randomChoice = (choices) => {
	return choices[Math.floor(Math.random() * choices.length)];
};

exports['load'] = (registerCommand, registerHandler, moduleStorage) => {
	registerCommand('roll', ['dice'], 'words', (api, args) => {
		var rolls = [];
		args.forEach(dice => {
			if(!(isNaN(parseInt(dice)))) {
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
};

exports['unload'] = () => {};
