const { Transform } = require('stream');

const SEPARATOR = '\t';

class Output extends Transform {
	constructor() {
		super({ writableObjectMode: true });
	}

	_transform(row, _, callback) {
		if (!this.keys) {
			this.keys = Object.keys(row);
			this.push(this.keys.join(SEPARATOR));
			this.push('\n');
		}
		this.outputRow(row);
		callback();
	}

	outputRow(row) {
		this.keys.forEach((key, i) => {
			if (i) this.push(SEPARATOR);
			this.push(row[key] + '');
		}, this);
		this.push('\n');
	}
}

module.exports = Output;
