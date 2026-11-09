const express = require('express');
const EnquiriesService = require('./EnquiriesService');

const router = express.Router();

router.post('/enquiries', async (req, res) => {
    try {
        res.status(201).json(await EnquiriesService.create(req.body || {}, req.ip));
    } catch (error) {
        if (!error.status) console.error('Error saving an enquiry:', error);
        if (error.retryAfterMs) res.set('Retry-After', String(Math.ceil(error.retryAfterMs / 1000)));
        res.status(error.status || 500).json({ message: error.status ? error.message : 'Failed to save your enquiry.' });
    }
});

module.exports = router;
