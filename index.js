const Words = require('./lib/words');
const Aggregator = require('./lib/aggregator');
const Output = require('./lib/output');
const program = require('commander');
const version = require('./package.json').version;

program
  .version(version)
	.option('-b, --by <period>', 'How to group score (day, month, year)', String, 'day')
	.option('-l, --lang <lang>', 'What language ', String, 'en')
	.parse(process.argv);

process.stdin
	.pipe(new Words())
	.pipe(new Aggregator(program.by, program.lang))
	.pipe(new Output())
	.pipe(process.stdout)
	;

// Ignore EPIPE's, f.e if this is piped to `tail`
process.on('uncaughtException', (err) => {
	if (err.message.includes('EPIPE')) {
		process.exit();
	}
	throw err;
});
