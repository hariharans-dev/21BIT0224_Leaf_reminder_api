const { Vonage } = require("@vonage/server-sdk");

async function sendSMS(to, text) {
  const vonage = new Vonage({
    apiKey: "d6995cc0",
    apiSecret: "2XkNbXPp4YCouOCR",
  });
  const from = "Vonage APIs";
  await vonage.sms
    .send({ to, from, text })
    .then(() => {
      console.log("Message sent successfully");
    })
    .catch(() => {
      console.log("There was an error sending the messages.");
    });
}

// const otp = "12345";
// const to = "919360745166";
// const text = "Leaf-Reminder otp: " + otp + "\n\n";

// sendSMS(to, text);

module.exports = { sendSMS };
