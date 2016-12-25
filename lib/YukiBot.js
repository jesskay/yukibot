'use strict';

const fs = require('fs');
const Discord = require('discord.js');
const jsonfile = require('jsonfile');
const TopoSort = require('topo-sort');

class YukiBot extends Discord.Client {
  constructor() {
    super();

    this.config = jsonfile.readFileSync('./config.json');
    this.creds = jsonfile.readFileSync('./credentials.json');

    this.modules = { 'core': this };
    this.loadModules();

    this.login(this.creds.token)
      .then(() => {
        this.emit('ready');
      }).catch(reason => {
        console.log('Failed: ' + reason);
      });
  }

  loadModules() {
    (this.config.modules || []).forEach(module => {
      this.loadModule(module);
    });
  }

  loadModule(name, parent) {
    if(this.modules[name] !== undefined) {
      return this.modules[name];
    }

    let Module = require('../modules/mod_' + name);
    let instance = new Module();

    // assign the global module early so weird circular dependencies might work, maybe
    this.modules[module] = instance;

    let dependencies = instance.dependencies.map(dependency => this.loadModule(dependency, name));
    instance.initialize(...dependencies, this);
    console.log(`Loaded module ${name}${parent ? ` (via ${parent})` : ``}`);

    return instance;
  }
}

module.exports = YukiBot;
