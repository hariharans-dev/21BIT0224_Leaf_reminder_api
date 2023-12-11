const { Configuration, OpenAIApi } = require("openai");

async function soilmoisture_range(plant, location) {
  async function weather_data(latitude, longitude) {
    try {
      const response = await fetch(
        "https://api.openweathermap.org/data/2.5/weather?lat=" +
          location.latitude +
          "&lon=" +
          location.longitude +
          "&appid=" +
          process.env.OPEN_WEATHER_API_KEY
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      return data.name;
    } catch (error) {
      console.error("Error fetching weather data:", error.message);
      throw error;
    }
  }

  const configuration = new Configuration({
    apiKey: process.env.OPEN_AI_KEY1,
  });
  const openai = new OpenAIApi(configuration);

  try {
    const place = await weather_data(location.latitude, location.longitude);
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `
              The sketch below estimates the level of soil moisture using the following threshold values:

              < 500 is too wet
              > 750 is dry enough to be watered

              exact soil moisture level required for ${plant} to grow in ${place}:
              ###
            `,
      max_tokens: 64,
      temperature: 0,
      top_p: 1.0,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
      stop: ["\n"],
    });

    return {
      success: true,
      data: response.data.choices[0].text,
    };
  } catch (error) {
    return {
      success: true,
      data: " 500-750",
    };
  }
}

module.exports = { soilmoisture_range };
