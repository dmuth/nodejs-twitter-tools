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
*	just_fans - If true, ignore accounts that we are already following
*	cursor - Our cursor for picking up an existing query
*
* @param {object} cb_add_follower A callback fired one or more 
*	times when we find a follower to add back.
* @param {object} cb Our callback
*
*/
Twitter.prototype.getFollowers = function(options, cb_add_follower, cb) {

	var self = this;
	var cb_main = cb;

	options.limit = options.limit || 5;
	options.skip = options.skip || 0;
	options.chunk_size = options.chunk_size || 5000;
	options.include_protected = options.include_protected || false;
	options.just_fans = options.just_fans || true;
	options.cursor = options.cursor || -1;

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
		options.stats = {};
		options.stats.fetched = 0;
		options.stats.skipped = 0;
		options.stats.skipped_we_have_enough_users = 0;
		options.stats.skipped_total = 0;
		options.stats.skipped_protected = 0;
		options.stats.skipped_already_following = 0;
		options.stats.added = 0;
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
			self._getFollowersCore(options, query_options, cb_add_follower, cb);
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

		var remaining;

		if (results && results.resources 
			&& results.resources.followers
			&& results.resources.followers["/followers/list"]) {
			remaining = results.resources.followers["/followers/list"].remaining;

		} else {
			var error = "Could not find value for reamining queries.  Data: " + JSON.stringify(error);
			cb(error);

		}

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
* @param {object} cb_add_follower A callback fired one or more 
*	times when we find a follower to add back.
* @param {object} cb Our callback
*/
Twitter.prototype._getFollowersCore = function (options, query_options, cb_add_follower, cb) {

	var cb_main = cb;
	var self = this;

	async.waterfall([
		function(cb) {
			//
			// More details on this API endpoint: 
			//	https://dev.twitter.com/docs/api/1.1/get/followers/list
			//
			self.twitter.get("followers/list", query_options, cb);

		}, function(results, response, cb) {

			var cb_parent = cb;

			options.next_cursor = results.next_cursor;
			if (results.users.length) {
				options.stats.fetched += results.users.length;
			}

			//
			// Loop through our list of followers
			//
			async.forEachLimit(results.users, 1, function(value, cb) {

				//
				// We don't want any more users? Stop.
				//
				if (options.left <= 0) {
					//winston.debug("We have enough users. Ignoring user: " + value.screen_name);
					options.stats.skipped_we_have_enough_users++;
					options.stats.skipped_total++;
					cb();
					return(null);
				}

				if (!options.include_protected) {
					if (value.protected) {
						winston.debug("Skipping protected user: " + value.screen_name);
						options.stats.skipped_protected++;
						options.stats.skipped_total++;
						cb();
						return(null);
					}
				}

				if (options.just_fans) {
					if (value.following) {
						winston.debug("Skipping user who we're already following: " + value.screen_name);
						options.stats.skipped_already_following++;
						options.stats.skipped_total++;
						cb();
						return(null);
					}
				}

				//
				// Users left to skip? Do so.
				//
				if (options.skip_left > 0) {
					options.skip_left--;
					options.stats.skipped++;
					options.stats.skipped_total++;
					cb();
					return(null);
				}

				//
				// Store this user and note that we need one less user.
				//
				cb_add_follower(value, function(error) {

					if (error) {
						cb(error);
						return(null);
					}

					options.results.push(value);
					options.left--;
					options.stats.added++;
					cb();

					});

			}, function(error) {
				cb_parent(error);

			});

		}, function(cb) {

			winston.info("Current stats: " + JSON.stringify(options.stats));

			if (options.left > 0) {
				//
				// Do we need more users?  Fetch from the next batch if we have a cursor.
				//
				if (options.next_cursor) {
					winston.info(util.format(
						"Have %s users, need %s more. Calling getFollowers() again with cursor ID '%s'",
							options.stats.added, options.left, options.next_cursor
							));
					options.cursor = options.next_cursor;
					process.nextTick(function() {
						self.getFollowers(options, cb_add_follower, cb);
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
				if (options.cursor) {
					winston.info("NOTE: Want to pick up here again? This is the current cursor: " + options.cursor);
				}
				cb(null, options.results);			

			}

		},
		function(results, cb) {
			cb_main(null, results);
			return(null);

		},

	], function(error) {
		cb_main(error);

	});

} // End of _getFollowersCore()


/**
* Retrieve info on the currently authenticated user.
*
* @param {object} cb Our callback
*
*/
Twitter.prototype.getMe = function(cb) {

	var options = {};
	options.skip_status = true;
	this.twitter.get("account/verify_credentials", options, cb);

} // End of getMe()



