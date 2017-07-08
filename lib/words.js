const { Transform } = require('stream');

const WORD = /[^a-z0-9ñ_-]+/;
const SEPARATORS = ['\t', ';', ','];

class Words extends Transform {
	constructor() {
		super({ objectMode: true });

		this.separator = null;
	}

	_transform(chunk, _, callback) {
		const str = (this.buffer || '') + chunk.toString('utf8');
		const lines = str.split(/\r?\n/);
		this.buffer = lines.pop();

		lines.forEach(this.processLine, this);
		callback();
	}

	_flush(callback) {
		if (this.buffer) {
			this.processLine(this.buffer);
		}
		callback();
	}

	processLine(line) {
		if (!this.separator) {
			return this.detectSeparator(line);
		}
		const cols = line.split(this.separator);
		const date = cols[0];
		const words = this.splitLine(cols[1]);
		words.forEach((word) => {
			this.push({ date, word });
		}, this);
	}

	splitLine(line) {
		return line.toLowerCase().split(WORD);
	}

	detectSeparator(line) {
		SEPARATORS.forEach((sep) => {
			if (!this.separator && line.includes(sep)) {
				this.separator = sep;
			}
		}, this);
	}
}

module.exports = Words;
