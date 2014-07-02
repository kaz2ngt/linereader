var stream = require('stream');
var util = require('util');

var Transform = stream.Transform;

function Filter(fn) {
    var self = this;
    Transform.call(self);
    self.line = '';
    self.execute = fn || function() { return true; };
}

util.inherits(Filter, Transform);

module.exports = Filter;

Filter.prototype._transform = function(chunk, encoding, next) {
    chunk = chunk.toString();
    if (!chunk) {
        return next();
    }

    var self = this;
    self.line += chunk;

    (function searchLine() {
        if (self.line.match(/\r?\n/)) {
            var record = RegExp.leftContext;
            self.line = RegExp.rightContext;
            if (self.execute(record)) {
                self.push(record);
            }
            searchLine();
        } else {
            next();
        }
    })();
};

Filter.prototype._flush = function() {
    var self = this;
    if (self.line) {
        if (self.execute(self.line)) {
            self.push(self.line);
        }
    }
    self.emit('end');
};
