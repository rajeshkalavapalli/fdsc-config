// Data access for the website enquiry form: runs the queries in sql.js.
// No business rules here (they are in enquiryService.js).
// Each function: try → run the query → return; catch → log which query failed → throw to the service.
const { customQuery } = require('../../utils/dbFunctions');
const { logError } = require('../../utils/access');
const sql = require('./sql');

exports.submitEnquiry = async ({ name, phone, email, course, qualification, message }) => {
    try {
        return await customQuery(sql.SUBMIT_ENQUIRY(), {
            Name: name,
            Phone: phone,
            Email: email,
            Course: course,
            Qualification: qualification,
            Message: message,
        });
    } catch (err) {
        logError('enquiryDA.submitEnquiry', err);
        throw err;
    }
};
