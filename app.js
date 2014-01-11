#!/usr/bin/env node
/**
* This script is used to interact with Twitter.
*/

var util = require("util");


var async = require("async");
var commander = require("commander");
var config = require("config");
var winston = require("winston");


var t = require("./lib/twitter");


winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {colorize: true, timestamp: true, level: "debug" })


var options = {};
options.consumer_key = config.twitter.consumer_key;
options.consumer_secret = config.twitter.consumer_secret;
options.access_token = config.twitter.access_token;
options.access_token_secret = config.twitter.access_token_secret;


/**
* This function returns a sample command line with options. Useful for 
* telling a user how to run this script to continue an aborted run.
*
* @param {object} options Our options
*/
function getArgsWithOpts(options) {

	var retval = "";

	if (options.limit) {
		retval += " --num " + options.left;
	}

	if (options.include_protected) {
		retval += " --include_protected";
	}

	if (options.cursor) {
		retval += " --cursor " + options.cursor;
	}

	if (options.add_user_concurrency) {
		retval += " --add_user_concurrency " + options.add_user_concurrency;
	}

	return(retval);

} // End of printArgsWithOpts()


/**
* Follow a user on Twitter
*
* @param {object} twitter Our twitter object
* @param {object} user The user object
* @param {object} options The current options and stats data
* @param {object} cb Our callback
*/
function followUser(twitter, user, options, cb) {

	winston.info(util.format(
		"Following user '%s'...", user.screen_name
		));

	if (commander.go) {
		twitter.addFriend(user.screen_name, function(error) {
			if (error) {
				error.screen_name = user.screen_name;
				error.options = JSON.parse(JSON.stringify(options));
				delete error.options.results;
				cb(error);
				return(null);
			}
			winston.info(util.format(
				"Added user '%s'!", user.screen_name
				));
			cb(null);
		});

	} else {
		winston.info(util.format(
			"Pretending to follow user '%s'", user.screen_name
			));
		cb(null);

	}

} // End of followUser()


/**
* Our main entry point.
*/
function main() {

	commander
		.version('0.0.1')
		.option("-n, --num <n>", "How many followers to add as friends", parseInt)
		.option("--include_protected", "Add protected users as friends (request access to their Twitter feeds, actually)")
		.option("--cursor <cursor>", "Our cursor from a previous run so we can pick up where we left off")
		.option("--add_user_concurrency <n>", "How many users do we want to add in parallel?")
		.option("--whoami", "Ask Twitter who the authenticating user is")
		.option("--go", "Actually add followers as twitter friends. (adding users is faked, otherwise)")
		.parse(process.argv)
		;

	var twitter = new t(options);

	if (commander.whoami) {
		//
		// Just ask Twitter who we are
		//
		twitter.getMe(function(error, results) {
			console.log(JSON.stringify(results, true, 4));
		});

	} else if (commander.num) {
		//
		// Add followers as friends
		//
		async.waterfall([
			function(cb) {
				var opt = {};
				opt.limit = commander.num;
				opt.skip = 0;
				//opt.chunk_size = 10;
				opt.include_protected = commander.include_protected;
				opt.just_fans = true;
				opt.cursor = commander.cursor;
				opt.add_user_concurrency = commander.add_user_concurrency;
	
				twitter.getFollowers(opt, followUser, cb);

			}, function(users, cb) {
					winston.info("Done adding users!");
					cb();

			}
			], function(error) {
				if (error) {
					winston.error(error);
					if (error.options) {
						var cmd = getArgsWithOpts(error.options);
						winston.info("To re-run this command, use these options: " + cmd);
					}
					process.exit(1);
				}

			});

	} else {
		commander.outputHelp();
		process.exit(1);

	}

} // End of main()


main();



