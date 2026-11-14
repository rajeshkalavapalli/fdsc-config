// Routes for the website enquiry form. Routes only: the work is in enquiryHandler.js.
const express = require('express');

const enquiryHandler = require('./enquiryHandler');

const router = express.Router();

router.post('/enquiries', enquiryHandler.submitEnquiry);

module.exports = router;
