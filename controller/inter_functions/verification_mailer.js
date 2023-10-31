const nodemailer = require("nodemailer");

const verification_mailer = (email, verifyurl) => {
  var emailTemplate =
    "<!DOCTYPE html>\n" +
    "<html>\n" +
    "  <head>\n" +
    '    <meta charset="utf-8">\n' +
    '    <meta name="viewport" content="width=device-width, initial-scale=1">\n' +
    "    <style>\n" +
    "      body {\n" +
    "        font-family: 'Open Sans', sans-serif;\n" +
    "        margin: 0;\n" +
    "        padding: 0;\n" +
    "      }\n" +
    "      .container {\n" +
    "        background-color: #1abc9c;\n" +
    "        width: 100%;\n" +
    "      }\n" +
    "      .content {\n" +
    "        padding: 20px; /* Add spacing around the content */\n" +
    "        background-color: #ffffff; /* White background for the email content */\n" +
    "        max-width: 600px; /* Limit the width for better email client compatibility */\n" +
    "        margin: 0 auto; /* Center the content horizontally */\n" +
    "      }\n" +
    "      .heading {\n" +
    "        font-size: 24px;\n" +
    "        color: #333; /* Dark text color */\n" +
    "        margin-top: 20px;\n" +
    "      }\n" +
    "      .welcome-text {\n" +
    "        font-size: 16px;\n" +
    "        color: #555; /* Slightly darker text color */\n" +
    "        margin-top: 10px;\n" +
    "      }\n" +
    "      .step-heading {\n" +
    "        font-size: 20px;\n" +
    "        color: #1abc9c; /* Green text color for headings */\n" +
    "        margin-top: 20px;\n" +
    "      }\n" +
    "      .step-description {\n" +
    "        font-size: 14px;\n" +
    "        color: #333;\n" +
    "        margin-top: 10px;\n" +
    "      }\n" +
    "      .action-button {\n" +
    "        background-color: #1abc9c;\n" +
    "        color: #fff;\n" +
    "        text-decoration: none;\n" +
    "        padding: 10px 20px;\n" +
    "        border-radius: 4px;\n" +
    "        display: inline-block;\n" +
    "        margin-top: 20px;\n" +
    "      }\n" +
    "      .footer {\n" +
    "        background-color: #1abc9c;\n" +
    "        text-align: center;\n" +
    "        padding: 10px 0;\n" +
    "        color: #fff;\n" +
    "      }\n" +
    "    </style>\n" +
    "  </head>\n" +
    "  <body>\n" +
    '    <div class="container">\n' +
    '      <div class="content">\n' +
    '        <h1 class="heading">Welcome To The Leaf Reminder!</h1>\n' +
    '        <p class="welcome-text">Hi User, welcome to Leaf-Reminder. Great to have you on board.</p>\n' +
    '        <h2 class="step-heading">1. Verify your account</h2>\n' +
    '        <p class="step-description">To ensure you\'re legitimate and not some fake person, please verify your account by clicking the button below.</p>\n' +
    '        <a class="action-button" href="' +
    verifyurl +
    '"        >Verify My Account</a>\n' +
    "      </div>\n" +
    "    </div>\n" +
    '    <div class="footer">\n' +
    "      Thank you for joining us. Have a great day!\n" +
    "    </div>\n" +
    "  </body>\n" +
    "</html>";

  console.log(verifyurl);

  const transporter = nodemailer.createTransport({
    host: "smtp-relay.sendinblue.com",
    port: 587,
    secure: false, // Use TLS version 1.2
    auth: {
      user: "shariharan182003@gmail.com",
      pass: "0HQ74vJ8pVUZj6wS",
    },
  });
  const message = {
    from: '"Leaf reminder 👻" <Leaf@gmail.com>', // sender address
    to: email, // list of receivers
    subject: "otp ✔", // Subject line
    text: "url", // plain text body
    html: emailTemplate,
  };

  transporter
    .sendMail(message)
    .then((info) => {
      return "email sent";
    })
    .catch((error) => {
      return error;
    });
};

module.exports = { verification_mailer };
