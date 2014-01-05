/**
* This module holds the class for connecting to Twitter.
*/


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

