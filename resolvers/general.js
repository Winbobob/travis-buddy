const helpers = require('./../helpers/helpers.js');

module.exports = (log, params, comment) => {
    return new Promise((resolve, reject) => {
        log = log.substr(log.indexOf('> mocha'));
        log = log.substr(log.indexOf('\n'));
        log = log.substr(0, log.indexOf('npm ERR!')).trim();

        log = helpers
            .replaceAll(log, '✓', '![alt text](https://raw.githubusercontent.com/bluzi/travis-buddy/master/resources/checkmark.png "Checkmark")');

        resolve({
            contents: log,
        });
    });
}