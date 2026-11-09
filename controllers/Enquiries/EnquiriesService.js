const db = require('../../db');
const { createLimiter } = require('../../utils/limiter');

// Website form → dbo.Enquiries. Values must match the website's course ids.
const COURSES = new Set(['open-10th', 'open-12th', 'intermediate', 'open-degree']);
const perIp = createLimiter({ max: 5, windowMs: 60 * 60 * 1000 }); // 5 enquiries per IP per hour
const perPhone = createLimiter({ max: 5, windowMs: 24 * 60 * 60 * 1000 }); // flood guard: 5 per mobile per day

const fail = (status, message, extra = {}) => Object.assign(new Error(message), { status, ...extra });
const text = (value, max) => String(value ?? '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').trim().slice(0, max);

exports.create = async (body, ip) => {
    // Honeypot: a hidden "website" field people never see. Bots fill it; pretend success, save nothing.
    if (text(body.website, 200)) return { ok: true };

    const name = text(body.name, 150);
    const phone = String(body.phone ?? '').replace(/\D/g, '').slice(-10);
    const email = text(body.email, 200);
    const course = text(body.course, 50);
    const qualification = text(body.qualification, 100);
    const message = text(body.message, 2000);

    if (name.length < 2) throw fail(400, 'Please enter your name.');
    if (!/^[6-9]\d{9}$/.test(phone)) throw fail(400, 'Enter a valid 10-digit mobile number.');
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw fail(400, 'Enter a valid email or leave it empty.');
    if (!COURSES.has(course)) throw fail(400, 'Choose a course you are interested in.');
    // DPDP Act 2023: we may only store and use the details after the visitor agrees on the form.
    if (body.consent !== true) throw fail(400, 'Please tick the consent box so we can contact you about your enquiry.');

    const ipWait = perIp.take(ip);
    if (ipWait) throw fail(429, 'Too many enquiries from this network. Please try again later or contact us on WhatsApp.', { retryAfterMs: ipWait });
    // Past the flood guard we answer "thank you" but save nothing, so the reply never reveals
    // whether a number has enquired before. Genuine repeats are merged by the database instead.
    if (perPhone.take(phone)) return { ok: true };

    const pool = await db.poolPromise;
    const request = pool.request();
    request.input('Name', db.sql.NVarChar(150), name);
    request.input('Phone', db.sql.NVarChar(20), phone);
    request.input('Email', db.sql.NVarChar(200), email ? email.toLowerCase() : null);
    request.input('Course', db.sql.NVarChar(50), course);
    request.input('Qualification', db.sql.NVarChar(100), qualification || null);
    request.input('Message', db.sql.NVarChar(2000), message || null);
    // dbo.SubmitEnquiry saves a new enquiry, or merges it into the same person's open one
    // (same mobile or email within 30 days). This login may run only that procedure.
    await request.execute('dbo.SubmitEnquiry');

    return { ok: true };
};
