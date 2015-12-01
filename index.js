#! /usr/bin/env node --harmony
var shell = require('shelljs/global'),
		co = require('co'),
		prompt = require('co-prompt'),
		program = require('commander'),
		chalk = require('chalk'),
		inquirer = require('inquirer');

var setupOpts = {
		type: "list",
		name: "setup",
		message: chalk.bold.magenta("What do you want to do?"),
		choices: [
				"Setup a new database locally",
				"Import data into and existing dbs",
				"Host a database on Digital Ocean"
		]
};
var localOpts = {
		type: "input",
		name: "port",
		message: chalk.bold.magenta("What port do you want Hey-P.I to run on?"),
		default: function () { return "3000"; },
		validate: function( value ) {
				var pass = value.match(/^\d{4}$/);
				if (pass) {
						return true;
				} else {
						return "Please enter a valid port number";
				}
		}
};
var start = {
		type: "confirm",
		name: "start",
		message: chalk.bold.magenta("Ready to create the DB?"),
};
var mongo = {
		type: "confirm",
		name: "install",
		message: chalk.bold.magenta("Want to attempt to install MongoDB on your system? \n") + chalk.bold.red('Durring the insrtall you will be required to enter your system pass')
};

//Initial load
inquirer.prompt([setupOpts], function(answers) {
		if(answers.setup === 'Setup a new database locally') {
				inquirer.prompt([localOpts,start], function(answers) {
						if(answers.start) {
								var validEnv = checkEnv();
								if(!validEnv) {
										console.log(chalk.green('valid'));
								} else {
										console.log(chalk.red('looks like you dont have mongo installed'));
										inquirer.prompt([mongo], function(answers) {
												if(answers.install) {
														installMongo();
												} else {
														console.log(chalk.magenta("try and install mongo using brew"), chalk.italic.green("http://brew.sh/"));
												}
										});
								}
						}
				});
		};
});

var checkEnv = function() {
		return which('mongo') !== null  ? true : false;
};

var installMongo = function() {
		console.log(chalk.green('Attemptting to install mongoDB'));
		var dir = pwd();
		mkdir('temp');
		cd('temp');
		exec('curl -O https://fastdl.mongodb.org/osx/mongodb-osx-x86_64-3.0.7.tgz');
		exec('tar -zxvf mongodb-osx-x86_64-3.0.7.tgz');
		exec('mkdir /usr/local/mongodb');
		exec('cp -R mongodb-osx-x86_64-3.0.7/ /usr/local/mongodb');
		console.log(chalk.green('please enter user password'));
		exec('sudo mkdir -p /data/db');
		var usr = exec('whoami').output.trim();
		if (usr !== undefined && usr !== '') {
				exec('sudo chown ' + usr + ' /data/db');
		}
		console.log(chalk.bold.green('Installation complete'));
		console.log(chalk.magenta('Removing temp folder...'));
		exec('cd .. && rm -rf temp');
		console.log(chalk.magenta('Creating launch daemon...'));
		exec('cp ./mongodb.plist /Library/LaunchDaemons/');
		exec('sudo launchctl load /Library/LaunchDaemons/mongodb.plist');
		console.log(chalk.bold.green(' _______________________________________________'));
		console.log(chalk.bold.green('|____________________IMPORTANT__________________|'));
		console.log(chalk.bold.green('|_______________________________________________|'));
		console.log(chalk.bold.green('| add this to your bash file (e.g. ~/.bashrc):  |'));
		console.log(chalk.bold.green('| export PATH=/usr/local/mongodb/bin:$PATH      |'));
		console.log(chalk.bold.green('|_______________________________________________|'));
};






