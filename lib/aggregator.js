const { Transform } = require('stream');
const fs = require('fs');

const VARIANTS = {
	'': 's',
	s: '',
	a: 'o',
	o: 'a',
	es: '',
	as: 'os',
	os: 'as',
};

class Aggregator extends Transform {
	constructor(group, lang) {
		super({ objectMode: true });

		this.group = group;
		this.scores = this.loadScores(lang);
	}

	_transform(data, _, callback) {
		const date = this.getDate(data.date);

		if (date !== this.date) {
			this.flushRow(date);
		}

		const score = this.getScore(data.word);
		this.score += score;
		this.abs += Math.abs(score);
		callback();
	}

	_flush(callback) {
		this.flushRow();
		callback();
	}

	getScore(word) {
		const { scores } = this;
		if (scores[word]) {
			return scores[word];
		}
		for (const end in VARIANTS) {
			if (!word.endsWith(end)) {
				continue;
			}
			const variant = word.slice(0, -end.length) + VARIANTS[end];
			if (scores[variant]) {
				return scores[variant];
			}
		}

		return 0;
	}

	flushRow(newDate = null) {
		const { date, score, abs } = this;
		if (date) {
			this.push({ date, score, abs });
		}
		this.date = newDate;
		this.score = 0;
		this.abs = 0;
	}

	getDate(date) {
		switch (this.group) {
			case 'day': return date;
			case 'month': return date.slice(0, 7);
			case 'year': return date.slice(0, 4);
			default: throw new Error('Invalid --by: ' + this.group);
		}
	}

	loadScores(lang) {
		const map = {};
		fs.readFileSync(`config/${lang}.tsv`, 'utf8')
			.split(/\r?\n/)
			.forEach((line) => {
				const [word, score] = line.split('\t');
				map[word] = parseInt(score, 10);
			});
		return map;
	}
}


module.exports = Aggregator;
