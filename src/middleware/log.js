const logRequest = (req, res, next) => {
    console.log('terjadi request ke api', req.path);
    next();
}

module.exports = logRequest;