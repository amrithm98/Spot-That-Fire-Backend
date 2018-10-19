var debug = require('debug')('middle');

module.exports = function(req, res, next) {
    idToken = req.body.idToken || req.headers['x-auth-token'] || "";
    if (req.url.startsWith('/admin')) {
        debug('Admin Login');
        return next();
    } else {
        debug('Public');
        return next();
    }
}