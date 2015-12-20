#! /usr/bin/env node --harmony
var shell = require('shelljs/global'),
		chalk = require('chalk'),
		inquirer = require('inquirer'),
		config = require('./dist/config.js'),
		fs = require("fs"),
		DigitalOceanApi = require('digital-ocean-api')

var setupOpts = {
		type: "list",
		name: "setup",
		message: chalk.bold.magenta("What do you want to do?"),
		choices: [
				"Setup a new database locally",
				"Host a Hey-PI database on Digital Ocean"
		]
};
var localOpts = {
		type: "input",
		name: "port",
		message: chalk.bold.magenta("What port do you want Hey-PI to run on?"),
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
var digitalOceanKey = {
		type: "input",
		name: "key",
		message: chalk.bold.magenta("Whats your digital ocean key?"),
};
var start = {
		type: "confirm",
		name: "start",
		message: chalk.bold.magenta("Ready to create the Database?"),
};
var confirmCosts = {
		type: "confirm",
		name: "confirmCosts",
		message: chalk.bold.magenta("this will cost $$$ ok?"),
};
var mongo = {
		type: "confirm",
		name: "install",
		message: chalk.bold.magenta("Want to attempt to install MongoDB on your system? \n") + chalk.bold.red('FYI: During the install you will be required to enter your system password')
};

//Initial load
var userArgs = process.argv.slice(2);

var option = userArgs[0];

if (option === 'start') {
	console.log(chalk.green('Stating the server...'));
	exec('node ./dist/server.js');
} else {

  inquirer.prompt([setupOpts], function(answers) {

		if(answers.setup === 'Setup a new database locally') {

			inquirer.prompt([localOpts,start], function(answers) {

				if(answers.start) {

					var validEnv = checkEnv();

						if(validEnv) {

							console.log(chalk.bold.green('looks like you have mongo installed! AWESOME!'));
							//set the port number in the config file;
							config.port = answers.port;

							var part1 = '"use strict";Object.defineProperty(exports, "__esModule", {value: true}); var config = '
							var part2 = ';exports["default"] = config;module.exports = exports["default"];//# sourceMappingURL=config.js.map'

							fs.writeFileSync('./dist/config.js', part1 + JSON.stringify(config) + part2);

							console.log(chalk.bold.green('Everything looks good...'));
							console.log(chalk.bold.gray('Run: '), chalk.bold.white('heypi start'));
							console.log(chalk.bold.gray('to get the server running. Then visit localhost:' + config.port + ' to see the docs'));

						} else {

							console.log(chalk.red('looks like you dont have mongo installed'));
							inquirer.prompt([mongo], function(answers) {

								if(answers.install) {

									installMongo();
									exit(0);
								} else {

									console.log(chalk.magenta("try and install mongo using brew"), chalk.italic.green("http://brew.sh/"));
									exit(0);
								}

							})
						}
					}
				})
			} else if (answers.setup === 'Host a Hey-PI database on Digital Ocean') {
				inquirer.prompt([digitalOceanKey,confirmCosts], function(answers) {
					if(confirmCosts) {

						var api = new DigitalOceanApi({
							token: answers.key
						})

						// api.getUserInfo(function(err, info) {
						// 	if (err) console.log(info);
						// 	console.log(info);
						// })
						var dropId = 9437091;
						// var droplet = {
						//   "name": "heypi",
						//   "region": "nyc3",
						//   "size": "512mb",
						//   "image": 14486461,
						//   "ssh_keys": null,
						//   "backups": false,
						//   "ipv6": true,
						//   "user_data": null,
						//   "private_networking": false
						// }
						//
						// api.createDroplet(droplet,function(err,resp) {
						// 	debugger;
						// 	if (err) console.log(err);
						// 	dropId = resp.id;
						// })

						var freq = 2500; // expressed in miliseconds
						var int = 0;

						console.log(chalk.italic.white('polling digital ocean...'));
							var timerId = setInterval( function() {
 								api.getDroplet(dropId,function(err,resp) {
									console.log(resp);
									var active = resp.status === 'active';
									if (active || int > 5 ) {
										console.log(chalk.italic.green('droplet created!'));
										clearInterval(timerId);
									} else {
										console.log(chalk.italic.white('polling digital ocean...'));
									}
									int++;
								})
							}, freq );


					} else {
						exit(1)
					}
			});
			}
	});

}
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
		console.log(chalk.magenta('run heypi start to run the server on port 3000'));
		console.log(chalk.magenta('or just run heypi again to tweak some settings'));
};
