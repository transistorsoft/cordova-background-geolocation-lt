var MODULE_NAME = "BackgroundGeolocation";
var exec = require("cordova/exec");

var LOG_LEVEL_DEBUG = "debug";
var LOG_LEVEL_NOTICE = "notice";
var LOG_LEVEL_INFO = "info";
var LOG_LEVEL_WARN = "warn";
var LOG_LEVEL_ERROR = "error";

var ORDER_ASC = 1;
var ORDER_DESC = -1;

var emptyFn = function() {};

var log = function(level, message) {
	exec(emptyFn, emptyFn, MODULE_NAME, 'log', [level, message]);
}

var validateQuery = function(query) {
  if (typeof(query) !== 'object') return {};

  if (query.hasOwnProperty('start') && isNaN(query.start)) {
    throw new Error('Invalid SQLQuery.start.  Expected unix timestamp but received: ' + query.start);
  }
  if (query.hasOwnProperty('end') && isNaN(query.end)) {
    throw new Error('Invalid SQLQuery.end.  Expected unix timestamp but received: ' + query.end);
  }
  return query;
}

module.exports = {
	ORDER_ASC: ORDER_ASC,
	ORDER_DESC: ORDER_DESC,

	error: function(msg) {
  	log(LOG_LEVEL_ERROR, msg);
  },
  warn: function(msg) {
    log(LOG_LEVEL_WARN, msg);
  },
  debug: function(msg) {
    log(LOG_LEVEL_DEBUG, msg);
  },
  info: function(msg) {
    log(LOG_LEVEL_INFO, msg);
  },
  notice: function(msg) {
    log(LOG_LEVEL_NOTICE, msg);
  },

  getLog: function(query) {
  	query = validateQuery(query);
  	return new Promise(function(resolve, reject) {
        var success = function(log) { resolve(log) }
        var failure = function(error) { reject(error) };
        exec(success, failure, MODULE_NAME, 'getLog', [query]);
    });
  },

  emailLog: function(email, query) {
  	query = validateQuery(query);
  	return new Promise(function(resolve, reject) {
        var success = function(success) { resolve(success) }
        var failure = function(error) { reject(error) };
        exec(success, failure, MODULE_NAME, 'emailLog', [email, query]);
    });
  },

  uploadLog: function(url, query) {
  	query = validateQuery(query);
  	return new Promise(function(resolve, reject) {
        var success = function(success) { resolve(success) }
        var failure = function(error) { reject(error) };
        exec(success, failure, MODULE_NAME, 'uploadLog', [url, query]);
    });
  },

  destroyLog: function() {
  	return new Promise(function(resolve, reject) {
        var success = function(success) { resolve(success) }
        var failure = function(error) { reject(error) };
        exec(success, failure, MODULE_NAME, 'destroyLog', []);
    });
  }
}