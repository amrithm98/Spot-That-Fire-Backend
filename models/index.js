"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const config = require('../config')()
const sequelize = new Sequelize(config.mysql.database, config.mysql.username, config.mysql.password, {
    logging: false,
    dialect : 'mysql'
});

const db = {};

fs
    .readdirSync(__dirname)
    .filter(function(file) {
        return (file.indexOf(".") !== 0) && (file !== "index.js");
    })
    .forEach(function(file) {
        const model = sequelize.import(path.join(__dirname, file));
        db[file.split('.')[0]] = model;
    });

Object.keys(db).forEach(function(modelName) {
    if ("associate" in db[modelName]) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;