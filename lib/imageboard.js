'use strict';

var request = require('request');
var cheerio = require('cheerio');

class NotFoundError extends Error {}
exports.NotFoundError = NotFoundError;

// e621
exports.e621 = (tags, callback) => {
  if(tags.length > 5) {
    return callback(new RangeError('Too many tags'));
  }

  request({
    url: 'https://e621.net/post/index.json?limit=1&tags=' + encodeURIComponent(`order:random ${tags.join(' ')}`),
    headers: {
      'User-Agent': 'YukiBot/0.0.1 (maintained by jesskay and cute-kitsune @ e621)'
    },
    json: true
  }, (err, res, body) => {
    if(body.length === 0) {
      return callback(new NotFoundError());
    } else {
      var pagelink = `https://e621.net/post/show/${body[0].id}`;
      var hotlink = body[0].file_url;
      callback(null, pagelink, hotlink);
    }
  });
};

// Gelbooru
var gbCookieJar = request.jar();
gbCookieJar.setCookie('user_id=251809', 'http://gelbooru.com');
gbCookieJar.setCookie('pass_hash=55c3b5386c486feb662a0785f340938f518d547f', 'http://gelbooru.com');
var gelbooru = request.defaults({
  jar: gbCookieJar
});
var gbBaseUri = 'http://gelbooru.com/index.php?page=dapi&s=post&q=index';

exports.gelbooru = (tags, callback) => {
  tags = encodeURIComponent(tags.join(' '));
  gelbooru(`${gbBaseUri}&limit=1&tags=${tags}`, (err, res, body) => {
    var $ = cheerio.load(body, { xmlMode: true });
    var count = parseInt($('posts').attr('count'), 10);
    if(isNaN(count)) {
      return callback(new Error('count was NaN: ' + count));
    } else if(count == 0) {
      return callback(new NotFoundError());
    } else {
      var randomPost = Math.floor(Math.random() * (count + 1));
      gelbooru(`${gbBaseUri}&limit=1&pid=${randomPost}&tags=${tags}`, (err, res, body) => {
        var $ = cheerio.load(body, { xmlMode: true });
        var pagelink = 'http://gelbooru.com/index.php?page=post&s=view&id=' + $('post').attr('id');
        var hotlink = $('post').attr('file_url');
        callback(null, pagelink, hotlink);
      });
    }
  });
};
