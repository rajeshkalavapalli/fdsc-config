// Helpers for the handlers (the HTTP side of each controller).
const { logError } = require('./access');

// Sends an error from a handler's catch block.
// Errors from fail() (with `status`) send their own message; anything else is logged and sends `fallback`.
// Rate-limited errors (retryAfterMs) also send a Retry-After header.
const sendError = (res, err, where, fallback) => {
    logError(where, err);
    if (err.retryAfterMs) res.set('Retry-After', String(Math.ceil(err.retryAfterMs / 1000)));
    return res.status(err.status || 500).json({ message: err.status ? err.message : fallback });
};

module.exports = { sendError };
