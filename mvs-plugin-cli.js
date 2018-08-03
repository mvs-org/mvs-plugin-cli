#!/usr/bin/env node

var program = require('commander');
var term = require('terminal-kit').realTerminal;
var fs = require('fs');
var Promise = require('bluebird');
const server = require('http-server');
var colors = require('colors/safe');
var path = require('path');
var dir = path.dirname(require.main.filename);

const PERMISSIONS = [
    {
        text: "List active permissions",
        value: "permissions"
    },
    {
        text: "Get activated netowrk",
        value: "network"
    },
    {
        text: "List addresses",
        value: "addresses"
    },
    {
        text: "List avatars",
        value: "avatars"
    },
    {
        text: "Sign messages",
        value: "sign"
    },
    {
        text: "Verify messages",
        value: "verify"
    },
    {
        text: "Create MIT",
        value: "create-mit"
    },
    {
        text: "Unlock wallet",
        value: "unlock"
    },
    {
        text: "Broadcast transactions",
        value: "broadcast"
    }
];

program
    .version('0.1.0')
    .description('Metaverse plugin CLI');

program
    .command('init [name]')
    .alias('i')
    .description('Initialize a new plugin project')
    .action(function(name, options) {
        return validname(name)
            .then(() => {
                if (fs.existsSync(name)) throw Error('Folder already exists.');
                else
                    return true;
            })
            .then(() =>
                ask('Enter plugin full name: ')
                  .then(fullname => select("Select permissions", PERMISSIONS)
                    .then(permissions => ask('Enter author name: ')
                        .then(author => ask('Enter description: ')
                            .then(description => ask('Enter URL (default: http://127.0.0.1:8080): ')
                                .then(url => {
                                    return {
                                        name: name,
                                        description: description,
                                        url: url || "http://127.0.0.1:8080",
                                        author: author,
                                        config: {
                                            permissions: permissions
                                        },
                                        translation: {
                                            default: {
                                                name: fullname
                                            }
                                        }
                                    };
                                }))))))
            .then(config => {
                fs.mkdirSync(name);
                fs.copyFileSync(dir + "/init/blank/index.html", name + "/index.html");
                fs.writeFileSync(name + '/config.json', JSON.stringify(config));
                console.log('The file has been saved!');
                console.log(config);
            })
            .catch(console.error);
    });

program
    .command('serve')
    .alias('s')
    .description('Serve the plugin using the built-in webserver')
    .option("-p, --port <port>", "Port to use")
    .action(function(options) {
        var logger = {
            info: console.log,
            request: function(req, res, error) {
                var date = new Date();
                if (error) {
                    logger.info(
                        '[%s] "%s %s" Error (%s): "%s"',
                        date, colors.red(req.method), colors.red(req.url),
                        colors.red(error.status.toString()), colors.red(error.message)
                    );
                } else {
                    logger.info(
                        '[%s] "%s %s" "%s"',
                        date, colors.cyan(req.method), colors.cyan(req.url),
                        req.headers['user-agent']
                    );
                }
            }
        };
        server.createServer({
            logFn: logger.request,
            cors: true,
            root: '.'
        }).listen(options.port || 8080);
    }).on('--help', function() {
        console.log('  Examples:');
        console.log();
        console.log('    $ mvs-plugin-cli serve --port 8080');
        console.log();
    });

program.parse(process.argv);


function validname(name) {
    return new Promise(resolve => {
        if (name == undefined || name == null || name.length == 0)
            throw Error('Name must be set');
        else if (name.length < 3)
            throw Error('Name must have at least 3 characters');
        else if (!/^[A-Za-z0-9-]+$/.test(name))
            throw Error('Name contains illegal characters');
        else if (!/^[A-Za-z0-9-]+$/.test(name))
            throw Error('Name contains illegal characters');
        else if (/^\-/.test(name))
            throw Error('Illegal start character');
        else if (/\-$/.test(name))
            throw Error('Illegal end character');
        else
            resolve(name);
    });
}

function ask(question) {
    term.on('key', function(name, matches, data) {
        if (name === 'CTRL_C') {
            terminate(1);
        }
    });
    return new Promise((resolve, reject) => {
        term.magenta(question);
        term.inputField(
            (error, input) => {
                term("\n");
                if (error)
                    reject(error.message);
                else
                    resolve(input);
            }
        );
    });
}

function select(label,options) {
    return new Promise(resolve => {
        term.magenta(label+"\n");
        var list = require('select-shell')({
            pointer: ' ▸ ',
            pointerColor: 'yellow',
            checked: ' ◉  ',
            unchecked: ' ◎  ',
            checkedColor: 'blue',
            msgCancel: 'No selected options!',
            msgCancelColor: 'orange',
            multiSelect: true,
            inverse: true,
            prepend: true,
            disableInput: true
        });

        options.forEach(option => list.option(option.text, option.value));
        list.list();

        list.on('select', function(options) {
            resolve(options.map(o=>o.value));
        });

        list.on('cancel', function(options) {
            resolve([]);
        });
    });
}

function terminate(status) {
    process.exit(status);
}
