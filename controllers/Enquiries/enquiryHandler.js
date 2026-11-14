// HTTP side of the website enquiry form.
// Each handler: read what the website sent → call ONE service function → send the result.
// Errors: a service error with `status` (from fail()) is a message for the visitor; anything else is logged and becomes a 500.
const { sendError } = require('../../utils/http');
const enquiryService = require('./enquiryService');

exports.submitEnquiry = async (req, res) => {
    try {
        const enquiryData = req.body || {};
        const result = await enquiryService.submitEnquiry(enquiryData, req.ip);
        return res.status(201).json(result);
    } catch (err) {
        return sendError(res, err, 'enquiryHandler.submitEnquiry', 'Failed to save your enquiry.');
    }
};
