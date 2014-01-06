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
winston.add(winston.transports.Console, {colorize: true, timestamp: true, })


var options = {};
options.consumer_key = config.twitter.consumer_key;
options.consumer_secret = config.twitter.consumer_secret;
options.access_token = config.twitter.access_token;
options.access_token_secret = config.twitter.access_token_secret;


commander
	.version('0.0.1')
	.option("-n, --num <n>", "How many followers to add as friends", parseInt)
	.option("--include_protected", "Add protected users as friends (request access to their Twitter feeds, actually)")
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
			opt.include_protected = false;
			opt.just_fans = true;
	
			twitter.getFollowers(opt, cb);

		}, function(users, cb) {
			//
			// Loop through our users and follow each of them
			//
			async.forEachLimit(users, 1, function(user, cb) {
				winston.info(util.format(
					"Following user '%s'...", user.screen_name
					));
				twitter.addFriend(user.screen_name, cb);

			}, function(error) {
				winston.info("Done adding users!");
				cb(error);

			});

		}
		], function(error) {
			winston.log("ERROR", error);
			process.exit(1);
		});

} else {
	commander.outputHelp();
	process.exit(1);

}


