// SQL for the website enquiry form.
// Query text only: each entry returns the SQL string, and enquiryDA.js runs it (sql.NAME()).

module.exports = {
    // dbo.SubmitEnquiry saves a new enquiry, or merges it into the same person's open one
    // (same mobile or email within 30 days). The website's database login may run only this procedure,
    // and it returns nothing, so the website can never read enquiries back.
    SUBMIT_ENQUIRY: () => {
        return `
            EXEC dbo.SubmitEnquiry
                @Name = @Name,
                @Phone = @Phone,
                @Email = @Email,
                @Course = @Course,
                @Qualification = @Qualification,
                @Message = @Message
        `;
    },
};
