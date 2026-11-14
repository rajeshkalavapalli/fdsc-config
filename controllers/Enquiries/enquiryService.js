// Business rules for the website enquiry form: spam trap, validation, consent and rate limits.
// No SQL and no req/res here: the database goes through enquiryDA.js, the HTTP side is enquiryHandler.js.
// Each exported function: try → do the work → return the result; catch → log unexpected errors → throw to the handler.
const { fail, logError, text } = require('../../utils/access');
const { createLimiter } = require('../../utils/limiter');
const enquiryDA = require('./enquiryDA');

// Must match the website's course ids.
const COURSES = new Set(['open-10th', 'open-12th', 'intermediate', 'open-degree']);
const perIp = createLimiter({ max: 5, windowMs: 60 * 60 * 1000 }); // 5 enquiries per network per hour
const perPhone = createLimiter({ max: 5, windowMs: 24 * 60 * 60 * 1000 }); // flood guard: 5 per mobile per day

/* ---------------- helpers ---------------- */

// Cleans what the form sent and throws a visitor-friendly message for anything missing or wrong.
const cleanEnquiry = (body) => {
    const enquiry = {
        name: text(body.name, 150),
        phone: String(body.phone ?? '').replace(/\D/g, '').slice(-10),
        email: text(body.email, 200).toLowerCase() || null,
        course: text(body.course, 50),
        qualification: text(body.qualification, 100) || null,
        message: text(body.message, 2000) || null,
    };
    if (enquiry.name.length < 2) throw fail(400, 'Please enter your name.');
    if (!/^[6-9]\d{9}$/.test(enquiry.phone)) throw fail(400, 'Enter a valid 10-digit mobile number.');
    if (enquiry.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(enquiry.email)) throw fail(400, 'Enter a valid email or leave it empty.');
    if (!COURSES.has(enquiry.course)) throw fail(400, 'Choose a course you are interested in.');
    // DPDP Act 2023: we may only store and use the details after the visitor agrees on the form.
    if (body.consent !== true) throw fail(400, 'Please tick the consent box so we can contact you about your enquiry.');
    return enquiry;
};

/* ---------------- enquiries ---------------- */

exports.submitEnquiry = async (body, ip) => {
    try {
        // Honeypot: a hidden "website" field people never see. Bots fill it; pretend success, save nothing.
        if (text(body.website, 200)) return { ok: true };

        const enquiry = cleanEnquiry(body);

        const ipWait = perIp.take(ip);
        if (ipWait) throw fail(429, 'Too many enquiries from this network. Please try again later or contact us on WhatsApp.', { retryAfterMs: ipWait });
        // Past the flood guard we answer "thank you" but save nothing, so the reply never reveals
        // whether a number has enquired before. Genuine repeats are merged by the database instead.
        if (perPhone.take(enquiry.phone)) return { ok: true };

        await enquiryDA.submitEnquiry(enquiry);
        return { ok: true };
    } catch (err) {
        logError('enquiryService.submitEnquiry', err);
        throw err;
    }
};
