var stream = require('stream');
var util = require('util');

var Transform = stream.Transform;

function ForEachSeries(fn, options) {
    var self = this;
    Transform.call(self, options);
    self.line = '';
    self.list = [];
    self.execute = fn || function(list, next) { this.push(list.join('\n') + '\n'); next(); };
    self.unit = options && options.unit || 100;
    self.on('error', function(err) {
        self.emit('end', err);
    });
}

util.inherits(ForEachSeries, Transform);

module.exports = ForEachSeries;

ForEachSeries.prototype._transform = function(chunk, encoding, next) {
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
            self.list.push(record);
            if (self.list.length < self.unit) {
                return searchLine();
            }
            var list = self.list;
            self.list = [];
            self.execute(list, function(err) {
                if (err) {
                    return self.emit('error', err);
                }
                searchLine();
            });
        } else {
            next();
        }
    })();
};

ForEachSeries.prototype._flush = function() {
    var self = this;
    if (self.line) {
        self.list.push(self.line);
        self.line = '';
    }
    if (!self.list.length) {
        return self.emit('end');
    }
    var list = self.list;
    self.list = [];
    self.execute(list, function(err) {
        if (err) {
            return self.emit('error', err);
        }
        self.emit('end');
    });
};
