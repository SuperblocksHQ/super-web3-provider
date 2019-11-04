const { execSync } = require('child_process');
const version = require('./package.json').version;

console.log('Publishing version ' + version);

if (version.indexOf('beta') < 0) {
    execSync('npm publish');
} else {
    execSync('npm publish --tag=beta');
}
