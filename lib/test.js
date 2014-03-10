var fs = require('fs');
var Promise = require('promise');
var request = require('request');
var cssParse = require('css-parse');

var promise = new Promise(function(resolve, reject) {
    request('http://t32k.me/static/blog/skelton.css', function(err, res, body) {
        if (!err && res.statusCode == 200) {
            resolve(res);
        } else {
            reject(err);
        }
    });
});
promise.done(function(res) {
    console.log(res.headers['content-length']);
    console.log(cssParse(res.body).stylesheet.rules);
});