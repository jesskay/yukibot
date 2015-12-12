"use strict";

var YukiBot = require('./lib/YukiBot.js');

var yuki = new YukiBot();
yuki.on("ready", () => {
  // :D
}).on('disconnected', () => {
  console.log('Disconnected. Time to die!');
  process.exit(1);
});
