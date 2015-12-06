exports['load'] = (registerCommand, moduleStorage) => {
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
    if(moduleStorage.getItem("poffcount") !== null) {
	n = moduleStorage.getItem("poffcount");
    }
    registerCommand('snowpoff', [], '', (api) => {
	if(Math.random() > 0.995) {
	    api.say("```\n* Eh?\n* There's 30 G inside this... what is this?\n```");
	} else {
	    api.say("```\n" + snowPoffMessages[n] + "\n```");
	    n = (n + 1) % snowPoffMessages.length;
	    moduleStorage.setItem("poffcount", n);
	}
    }, "snowpoff: And this... is a useless command. Fun though!");
};

exports['unload'] = () => {};

