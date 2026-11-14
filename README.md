# FDSC API (fdsc-config)

### V 1.0.0

- Added enquiry api to save website enquiries in the FDSC database

### V 1.0.1

- Added validations, spam protection and limits per network and per mobile number

### V 1.0.2

- Separate database login for the website that can only add enquiries and cannot read them

### V 1.0.3

- Enquiry requires consent and the consent time is saved

### V 1.0.4

- Repeat enquiries from the same mobile or email within 30 days are added to the existing enquiry instead of creating a new one
- Website login can now only run the submit enquiry procedure

### V 1.0.5

- Split the enquiry controller into index (routes), enquiryHandler, enquiryService, enquiryDA and sql files with try / catch in each layer
- Errors are logged once with the exact function name

### V 1.0.6

- Automatic retry while the Azure database wakes up from pause, so enquiries do not fail
