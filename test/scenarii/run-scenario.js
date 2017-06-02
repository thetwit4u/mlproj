#!/usr/bin/env node

"use strict";

const chalk    = require('chalk');
const fs       = require('fs');
const scenario = require('./lib/scenario');
const cmd      = require('../../src/commands');

var tests = [];
if ( process.argv.length === 2 ) {
    [ 'setup' ].forEach(dir => addDir(tests, dir));
}
else if ( process.argv.length !== 3 ) {
    console.log('Must have exactly one option (the path to the scenario file to run)');
    process.exit(1);
}
else if ( isDir(process.argv[2]) ) {
    addDir(tests, process.argv[2]);
}
else {
    tests.push(process.argv[2]);
}

function isScenario(path) {
    return path.endsWith('.js');
}

function isDir(path) {
    return fs.statSync(path).isDirectory();
}

function addDir(tests, dir) {
    if ( dir.endsWith('/') ) {
        dir = dir.slice(0, dir.length - 1);
    }
    fs.readdirSync(dir).forEach(f => {
        var p = dir + '/' + f;
        if ( isDir(p) ) {
            addDir(tests, p);
        }
        else if ( isScenario(p) ) {
            tests.push(p);
        }
    });
}

var runner = {
    reset       : function() {
        this.calls       = null;
        this.nextCallIdx = 0;
        this.history     = [];
    },
    // `calls` must be set when running a scenario
    calls       : null,
    nextCallIdx : 0,
    nextCall    : function() {
        return this.calls[this.nextCallIdx++];
    },
    history     : [],
    progress    : function(verb, api, url, data) {
        // push this call in history
        var hist = {
            verb : verb,
            api  : api,
            url  : url
        };
        if ( data ) {
            hist.data = data;
        }
        this.history.push(hist);
        // log this call
        // TODO: Make it depends on a "verbose" flag
        if ( false ) {
            console.log('Send ' + verb + ' on ' + api + ' at ' + url);
        }
    },
    fail        : function(call, msg) {
        console.log(chalk.red('FAIL') + ': ' + msg);
        console.dir(call);
        console.log('Call history so far:');
        console.dir(this.history);
        var err = new Error(msg);
        err.expected = call;
        err.actual   = this.history[this.history.length - 1];
        throw err;
    }
};

var failures = [];
tests.forEach(test => {
    // TODO: Create a real new instance each time here, instead of "reset"...
    runner.reset();
    console.log('** Running ' + test);
    try {
        var t = test;
        if ( t[0] !== '.' ) {
            t = './' + t;
        }
        require(t).test(runner, scenario, cmd, './');
    }
    catch ( err ) {
        // test failure
        if ( err.expected ) {
            failures.push({
                test     : test,
                msg      : err.message,
                expected : err.expected,
                actual   : err.actual
            });
        }
        // any other error
        else {
            failures.push({
                test : test,
                err  : err
            });
        }
    }
});

console.log();
console.log('======= ' + chalk.bold('Summary') + ' ========');
console.log();
if ( failures.length ) {
    console.log('Some scenario failed.');
}
else {
    console.log('All scenarii passed!');
}
console.log();
failures.forEach(f => {
    if ( f.err ) {
        console.log(chalk.red('Error') + ': ' + f.test);
        console.log(f.err);
    }
    else {
        console.log(chalk.red('Failure') + ': ' + f.test);
        console.log(f.msg);
    }
    console.log();
});

// TODO: For that, first make fail not to exit, and accumulate failures
