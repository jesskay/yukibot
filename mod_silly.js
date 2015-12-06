exports['load'] = (registerCommand) => {
    var snowPoffMessages = [
	"* It's a snow poff.",
	"* And this... Is a snow poff.",
	"* This, however, is a snow poff.",
	"* Surprisingly, it's a snow poff.",
	"* Snow poff...",
	"* Is it really a snow poff?",
	"* Behold! A snow poff.",
	"* What's this called?"
        ];
    var n = 0;
    var n2 = (snowPoffMessages.length - 1);
    registerCommand('snowpoff', [], '', (api) => {
	if(Math.random() > 0.995) {
	    api.reply("```\n* Eh?\n* There's 30 G inside this... what is this?\n```");
	} else {
	    api.reply("```\n" + snowPoffMessages[n] + "\n```");
	    n = (n + 1) % snowPoffMessages.length;
	}
    }, "snowpoff: And this... is a useless command. Fun though!");
};

exports['unload'] = () => {};

