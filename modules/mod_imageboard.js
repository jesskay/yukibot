var request = require('request');
var cheerio = require('cheerio');

exports['load'] = (registerCommand, registerHandler, moduleStorage) => {
	registerCommand('e621', [], 'raw', (api, argStr) => {
    // Break early if too long
    if(argStr.split(/\s+/).length > 5) {
      api.reply("Oops, too many tags. You can only use 5!");
      return;
    }

		var tags = "order:random " + argStr;
		request({
			url: "https://e621.net/post/index.json?limit=1&tags=" + encodeURIComponent(tags),
			json: true
		}, (err, res, body) => {
			if(body.length === 0) {
				api.reply("Sorry, couldn't find anything. :<");
			} else {
				var resultMsg = [];
				resultMsg.push("Okay, I think I found something~");
				resultMsg.push("https://e621.net/post/show/" + body[0].id);
				resultMsg.push(body[0].file_url);

				api.reply(resultMsg.join('\n'));
			}
		});
	}, "e621 <tags>: links a random image from the tag(s) provided.");

	var gbCookieJar = request.jar();
	gbCookieJar.setCookie('user_id=251809', 'http://gelbooru.com');
	gbCookieJar.setCookie('pass_hash=55c3b5386c486feb662a0785f340938f518d547f', 'http://gelbooru.com');
	var gelbooru = request.defaults({
		jar: gbCookieJar
	});
	var gbBaseUri = 'http://gelbooru.com/index.php?page=dapi&s=post&q=index';
	registerCommand('gelbooru', ['gel'], 'raw', (api, argStr) => {
		gelbooru(`${gbBaseUri}&limit=1&tags=${encodeURIComponent(argStr)}`, (err, res, body) => {
			var $ = cheerio.load(body, { xmlMode: true });
			var count = parseInt($('posts').attr('count'), 10);
			if(isNaN(count)) {
				api.reply('Something went very wrong! Try again later maybe? :<');
			} else {
				var randomPost = Math.floor(Math.random() * (count + 1));
				gelbooru(`${gbBaseUri}&limit=1&pid=${randomPost}&tags=${encodeURIComponent(argStr)}`, (err, res, body) => {
					var $ = cheerio.load(body, {
						xmlMode: true
					});
					var resultPagelink = 'http://gelbooru.com/index.php?page=post&s=view&id=' + $('post').attr('id');
					var resultHotlink = $('post').attr('file_url');
					api.reply(['Okay! I think I found something~', resultPagelink, resultHotlink].join('\n'));
				});
			}
		});
	}, "gelbooru <tags>: links a random image from the tag(s) provided");
	
	var ratingToTag = {
		"safe": "rating:safe",
		"questionable": "rating:questionable",
		"explicit": "rating:explicit",
		"s": "rating:safe",
		"q": "rating:questionable",
		"e": "rating:explicit",
		"-safe": "-rating:safe",
		"-questionable": "-rating:questionable",
		"-explicit": "-rating:explicit",
		"-s": "-rating:safe",
		"-q": "-rating:questionable",
		"-e": "-rating:explicit",
		"lewd": "-rating:safe"
	};
	
	registerCommand('am', [], 'words', (api, args) => {
		var tags = "fox_ears fox_tail -spread_anus -huge_breasts -gigantic_breasts -gore -scat score:>50 " + (ratingToTag[args[0].toLowerCase()] || "rating:safe");
		gelbooru(`${gbBaseUri}&limit=1&tags=${encodeURIComponent(tags)}`, (err, res, body) => {
			var $ = cheerio.load(body, {xmlMode: true});
			var count = parseInt($('posts').attr('count'), 10);
			if(isNaN(count)) {
				api.reply('Something went very wrong! Try again later maybe? :<');
			} else {
				var randomPost = Math.floor(Math.random() * count);
				gelbooru(`${gbBaseUri}&limit=1&pid=${randomPost}&tags=${encodeURIComponent(tags)}`, (err, res, body) => {
					var $ = cheerio.load(body, {xmlMode: true});
					var resultPagelink = 'http://gelbooru.com/index.php?page=post&s=view&id=' + $('post').attr('id');
					var resultHotlink = $('post').attr('file_url');
					api.reply([resultPagelink, resultHotlink].join('\n'));
				});
			}
		});
	}, "am: links a random safe (usually, tagging is hard) foxie from gelbooru");
	
	registerCommand('riley', [], 'words', (api, args) => {
		var tags = "akane_(naomi) " + (ratingToTag[args[0].toLowerCase()] || "rating:safe");
		gelbooru(`${gbBaseUri}&limit=1&tags=${encodeURIComponent(tags)}`, (err, res, body) => {
			var $ = cheerio.load(body, {xmlMode: true});
			var count = parseInt($('posts').attr('count'), 10);
			if(isNaN(count)) {
				api.reply('Something went very wrong! Try again later maybe? :<');
			} else {
				var randomPost = Math.floor(Math.random() * count);
				gelbooru(`${gbBaseUri}&limit=1&pid=${randomPost}&tags=${encodeURIComponent(tags)}`, (err, res, body) => {
					var $ = cheerio.load(body, {xmlMode: true});
					var resultPagelink = 'http://gelbooru.com/index.php?page=post&s=view&id=' + $('post').attr('id');
					var resultHotlink = $('post').attr('file_url');
					api.reply([resultPagelink, resultHotlink].join('\n'));
				});
			}
		});
	}, "riley: links a random safe (usually, tagging is hard) Akane from gelbooru");
};

exports['unload'] = () => {};
