/**
* This module holds the class for connecting to Twitter.
*/

var async = require("async");
var util = require("util");
var winston = require("winston");
var twit = require("twit");


/**
* Our constructor.
* 
* @param {options} object This should have the following keys:
*	consumer_key, consumer_secret, acccess_token, access_token_secret
*/
exports = module.exports = Twitter = function (options) {

	this.options = JSON.parse(JSON.stringify(options));
	this.twitter = new twit(options);

}


/**
* Retrieve user info.
*
* @param {string} screen_name The user's twitter name.
* @param {object} cb Our callback
*/
Twitter.prototype.getUser = function(screen_name, cb) {
	var options = {};
	options.screen_name = screen_name;
	this.twitter.get("users/show", options, cb);
}


/**
* Add a friend/request to follow someone.
*
* @param {string} screen_name The user's twitter name.
* @param {object} cb Our callback
*
*/
Twitter.prototype.addFriend = function(screen_name, cb) {
	options = {};
	options.screen_name = screen_name;
	this.twitter.post("friendships/create", options, cb);
}


/**
* Return our rate limit status.
*
* @param {object} cb Our callback
*
*/
Twitter.prototype.getRateLimitStatus = function(cb) {
	this.twitter.get("application/rate_limit_status", function(error, results, request) {
		cb(error, results, request);
		});
} // End of getRateLimitStatus()


/**
*
* Get our followers.
*
* @param {object} options Our options:
*	limit - Limit how many followers are retrieved
*	skip - How many followers are skipped
*	chunk_size - How many followers to fetch per query
*	include_protected - Include protected users in the list 
*		(default: false, we want to skip protected users)
//opt.just_fans = true;
*
* @param {object} cb Our callback
*
*/
Twitter.prototype.getFollowers = function(options, cb) {

	var self = this;
	var cb_main = cb;

	options.limit = options.limit || 5;
	options.skip = options.skip || 0;
	options.chunk_size = options.chunk_size || 100;
	options.include_protected = options.include_protected || false;
	options.just_fans = options.just_fans || true;

	//
	// How many followers left to fetch?
	//
	options.left = options.left || options.limit;

	//
	// How many followers left to skip?
	// Only set this on the first call to this function
	//
	if (!options.beenhere) {
		options.skip_left = options.skip;
	}
	options.beenhere = true;

	options.results = options.results || [];

	var query_options = {};
	if (options.chunk_size) {
		query_options.count = options.chunk_size;
	}
	if (options.cursor) {
		query_options.cursor = options.cursor;
	}
	//winston.info(options);
	winston.info("Users left to skip: " + options.skip_left);
	winston.info("Twitter query options: " + JSON.stringify(query_options));

	async.waterfall([
		function(cb) {
			self.getFollowersCheckRateLimit(cb);
		},
		function(cb) {
			self._getFollowersCore(options, query_options, cb);
		}, function(results) {
			cb_main(null, results);
		},
		], 
		function(error) {
			cb_main(error);
		});

} // End of getFollowers()


/**
* Check our rate limit for pulling followers.
*
* @param {object} cb Our callback
*/
Twitter.prototype.getFollowersCheckRateLimit = function(cb) {

	this.getRateLimitStatus(function(error, results, response) {
		var remaining = results.resources.followers["/followers/list"].remaining;
		if (remaining <= 0) {
			var error = util.format(
				"No queries left on this endpoint. (%s left)",
				remaining
				);
			cb(error);

		} else {
			winston.info("Number of queries left in quota: " + remaining);
			cb(null);

		}

	});

} // End of getFollowersCheckRateLimit()


/**
* Our core function to fetch followers.
*
* @param {object} options Options that were originally passed into getFollowers()
* @param {object} query_options Options to pass into the API call
* @param {object} cb Our callback
*/
Twitter.prototype._getFollowersCore = function (options, query_options, cb) {

	var self = this;

	//
	// More details on this API endpoint: 
	//	https://dev.twitter.com/docs/api/1.1/get/followers/list
	//
	this.twitter.get("followers/list", query_options, function(error, results) {
		if (error) {
			cb(error);
			return(null);
		}

		//
		// Loop through our list of followers
		//
		results.users.forEach(function(value) {

			if (!options.include_protected) {
				if (value.protected) {
					winston.info("Skipping protected user: " + value.screen_name);
					return(null);
				}
			}

			//
			// Users left to skip? Do so.
			//
			if (options.skip_left > 0) {
				options.skip_left--;
				return(null);
			}

			//
			// We don't want anymore users? Stop.
			//
			if (options.left <= 0) {
				return(null);
			}

			//
			// Store this user and note that we need one less user.
			//
			options.results.push(value);
			options.left--;

		});

		if (options.left > 0) {
			//
			// Do we need more users?  Fetch from the next batch if we have a cursor.
			//
			if (results.next_cursor) {
				winston.info(util.format(
					"Have %s users, need %s more. Calling getFollowers() again with cursor ID '%s'",
						options.results.length, options.left, results.next_cursor
						));
				options.cursor = results.next_cursor;
				process.nextTick(function() {
					self.getFollowers(options, cb);
				});

			} else {
				winston.error(util.format(
					"We still need %s more users, but have no more users left, sorry!",
						options.left
						));
				cb(null, options.results);			

			}

		} else {
			//
			// Got all the users we need. We're done
			//
			cb(null, options.results);			

		}

	});

} // End of _getFollowersCore()




