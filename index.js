var zlib = require('zlib');
var util = require('util');
var events = require('events');

var EventEmitter = events.EventEmitter;

var transform = require('./transform');

function LineReader(rs, options) {
    this.rs = rs;
    this.options = options || {};

    if (this.options.gunzip) {
        var gunzip = zlib.createGunzip();
        this.rs = rs.pipe(gunzip);
    }
}

util.inherits(LineReader, EventEmitter);

module.exports = LineReader;

LineReader.prototype.forEachSeries = function(unit, fn) {
    var self = this;
    var forEachSeries = new transform.forEachSeries(fn, { unit: unit });
    self.rs = self.rs.pipe(forEachSeries);
    self.rs.on('error', function(err) { self.emit('end', err); });
    return self;
};

LineReader.prototype.filter = function(fn) {
    var self = this;
    var filter = new transform.filter(fn);
    self.rs = self.rs.pipe(filter);
    self.rs.on('error', function(err) { self.emit('end', err); });
    return self;
};

LineReader.prototype.end = function(callback) {
    this.once('end', callback);
    return this;
};