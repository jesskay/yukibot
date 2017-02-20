'use strict';

const MongoClient = require('mongodb').MongoClient;
const Module = require('../lib/Module');

const log = require('minilog')('database');
require('minilog').enable();

class DatabaseModule extends Module {
  constructor(name, core) {
    super(name, core);
    this.db = null;
  }

  initialize() {
    MongoClient.connect(this.core.config.database.url)
      .then(db => {
        log.info('Connected.');
        this.db = db;
      });
  }

  collection(name, guild = 'global') {
    return this.db.collection(`${guild}.${name}`);
  }
}

module.exports = DatabaseModule;
