require('dotenv').config();
let loading, mongoCall = 0;
const mongoose = require('mongoose'),
    chalk = require('chalk'),
    logger = require('./logger'),
    User = require('../models/user.js');

const get = (token, cb) => {
        
    },

    update = (token, updates, cb) => {
        
    },

    consoleLoader = (msg) => {
        let x = 0, 
            load = ['⠁ ', '⠈ ', ' ⠁', ' ⠈', ' ⠐', ' ⠠', ' ⢀', ' ⡀', '⢀ ', '⡀ ', '⠄ ', '⠂ '];
        return setInterval(() => {
            logger.stdout('\r' + load[x = (++x < load.length) ? x : 0] + ' ' + msg);
        }, 50);
    },

    dbOptions = { useNewUrlParser: true, useFindAndModify: false, useUnifiedTopology: true, useCreateIndex: true, poolSize: 10 },
    mongoConnect = (cb) => {
        loading = consoleLoader(' '.repeat(34));
        mongoose.connect(process.env.MONGO_KEY, dbOptions).then(
            () => {
                clearInterval(loading);
                logger.stdout('\r');
                logger.log(false, 'Connection Established');
                cb();
            }
        ).catch((e) => {
            clearInterval(loading);
            ++mongoCall > 1 && logger.stdout('\033[A\33[2K\r');

            logger.stdout('\r');
            logger.error(false, 'Connection Failed: ', chalk.red(e), chalk.red.dim((mongoCall > 1) ? '(' + mongoCall + ')' : ''));
            loading = consoleLoader('  Reconnecting');
            setTimeout(mongoConnect, 10000);
        });
    },
    
    connect = (cb) => {
        logger.log(true, 'Connecting to MongoDB Atlas Server');
        mongoConnect(() => {
            cb();
        });
    };

module.exports = { consoleLoader, connect, get, update };