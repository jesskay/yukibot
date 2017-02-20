'use strict';

const Discord = require('discord.js');
const fs = require('fs');
const jsonfile = require('jsonfile');

const log = require('minilog')('core');
require('minilog').enable();

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
      log.info(`Loaded module ${name} from cache${parent ? ` (via ${parent})` : ``}`);
      return this.modules[name];
    }

    const Module = require('../modules/mod_' + name);
    const instance = new Module(name, this);

    // assign the global module early so weird circular dependencies might work, maybe
    this.modules[name] = instance;

    const dependencies = Module.dependencies.map(dependency => this.loadModule(dependency, name));
    instance.initialize(...dependencies);
    log.info(`Loaded module ${name}${parent ? ` (via ${parent})` : ``}`);

    return instance;
  }

  get prefix() {
    return this.config.prefix;
  }
}

module.exports = YukiBot;
