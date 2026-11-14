// An error with an HTTP status and a message that is safe to show to the visitor.
// `extra` can carry e.g. { retryAfterMs } for rate-limited requests.
const fail = (status, message, extra = {}) => Object.assign(new Error(message), { status, ...extra });

// Logs an unexpected error once, with where it happened (e.g. "enquiryDA.submitEnquiry").
// Errors made by fail() are expected (wrong input, too many tries) and are not logged.
// The deepest layer that catches the error logs it; the layers above see `logged` and stay quiet.
const logError = (where, err) => {
    if (err && !err.status && !err.logged) {
        console.log(`error in ${where}`, err);
        err.logged = true;
    }
};

// Trimmed text without control characters, cut to `max` characters.
const text = (value, max) => String(value ?? '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').trim().slice(0, max);

module.exports = { fail, logError, text };
