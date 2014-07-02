var fs = require('fs');
var path = require('path');

var transform = {};
fs.readdirSync(__dirname).filter(function(v) {
    return v !== 'index.js' && v.charAt(0) !== '.';
}).forEach(function(name) {
    var _name = path.basename(name, '.js');
    transform[_name] = require('./' + _name);
});

module.exports = transform;
