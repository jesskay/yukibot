'use strict';

const Module = require('../lib/Module');
const MongoClient = require('mongodb').MongoClient;
const log = require('minilog')('database');

class DatabaseModule extends Module {
  constructor(name, core) {
    super(name, core);
    this.db = null;
  }

  initialize() {
    MongoClient.connect(this.core.config.database)
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
