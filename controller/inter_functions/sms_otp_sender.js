const { Vonage } = require("@vonage/server-sdk");

async function sendSMS(to, text) {
  const vonage = new Vonage({
    apiKey: process.env.VONAGE_API_KEY,
    apiSecret: process.env.VONAGE_SECRET_VALUE,
  });
  const from = "Vonage APIs";

  try {
    const response = await vonage.sms.send({ to, from, text });

    if (response["message-count"] === "1") {
      const firstMessage = response.messages[0];

      if (firstMessage.status === "0") {
        console.log("Message sent successfully");
      } else {
        console.log("Failed to send SMS. Details:", firstMessage);
        // Handle specific failed message if needed
      }
    } else {
      console.log("Unexpected response format.");
    }
  } catch (error) {
    console.log("There was an error sending the messages.");
    return error;
  }
}

module.exports = { sendSMS };
