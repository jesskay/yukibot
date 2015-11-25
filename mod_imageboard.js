var request = require('request');

exports['load'] = (registerCommand) => {
    registerCommand('e621', [], 'raw', (api, argStr) => {
	var tags = "order:random " + argStr;
	request(
	    {url: "https://e621.net/post/index.json?limit=1&tags=" + encodeURIComponent(tags), json: true},
	    (err, res, body) => {
		if(body.length === 0) {
		    api.reply("Sorry, couldn't find anything. :<")
		} else {
		    var resultMsg = [];
		    resultMsg.push("Okay, I think I found something~");
		    resultMsg.push("https://e621.net/post/show/" + body[0].id);
		    resultMsg.push(body[0].file_url);
		    
		    api.reply(resultMsg.join('\n'));
		}
	     }
	);
    }, "e621 <tags>: links a random image from the tag(s) provided.");
};

exports['unload'] = (unregisterCommand) => {
    ['e621'].forEach(cmdName => unregisterCommand(cmdName));
};
