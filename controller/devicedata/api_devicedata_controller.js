const { validationResult } = require("express-validator");
const Device_data = require("./device_data_controller.js");
const {
  soilmoisture_range,
} = require("../inter_functions/soilmoisture_openapi.js");

const device_object = new Device_data();

function decode_byte64(base64Credentials) {
  const decodedCredentials = Buffer.from(base64Credentials, "base64").toString(
    "utf-8"
  );
  const [user, password] = decodedCredentials.split(":");
  return [user, password];
}

const devicedata_post = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    const [authType, apiKey] = authHeader.split(" ");
    const [key, deviceid] = decode_byte64(apiKey);

    const currentDateTime = new Date();
    const filter = { deviceid: deviceid };
    const data = {
      deviceid: deviceid,
      data: [
        {
          time: currentDateTime,
          soilmoisture: req.body.soilmoisture,
          temperature: req.body.temperature,
        },
      ],
    };

    let status = 200;
    var responsedata = {};

    const result = await device_object.findone_devicedata(filter);

    if (result === null) {
      await device_object.createdata_devicedata(data);
      message = "created device for the first time";
    } else {
      const newData = {
        time: currentDateTime,
        soilmoisture: req.body.soilmoisture,
        temperature: req.body.temperature,
      };
      const update = { $push: { data: newData } };
      await device_object.data_additon(filter, update);

      const controls = await device_object.find_controls(filter);

      if (controls === null) {
        status = 404;
        message = "no deviceid found";
      } else {
        if (controls.mode === "manual") {
          await device_object.update_controls(filter, {
            $set: {
              mode: "automatic",
              water: controls.water,
              time: currentDateTime,
            },
          });
          status = 200;
          responsedata = { message: "data added", water: controls.water };
        } else if (controls.mode === "automatic") {
          const { soilmoisture } = req.body;
          const { plant, location } = await device_object.findone_devicedata(
            filter
          );
          var soilmoisture_response = await soilmoisture_range(plant, location);
          soilmoisture_response = soilmoisture_response.data.split("-");
          const range = soilmoisture_response.map((str) => parseInt(str, 10));
          const avg_soilmoisture = (range[0] + range[1]) / 2;
          if (soilmoisture > avg_soilmoisture) {
            status = 200;
            responsedata = {
              message: "data added",
              water: controls.water,
            };
          } else {
            status = 200;
            responsedata = {
              message: "data added",
            };
          }
        } else {
          const timeinterval = controls.timeinterval;
          const lasttime = controls.time;
          const timedifference = currentDateTime - lasttime;
          const betweentime = timedifference / (1000 * 60);
          if (betweentime >= timeinterval) {
            await device_object.update_controls(filter, {
              $set: { time: currentDateTime },
            });
            status = 200;
            responsedata = { message: "data added", water: controls.water };
          } else {
            status = 200;
            responsedata = { message: "data added" };
          }
        }
      }
    }

    return res.status(status).json(responsedata);
  } catch (error) {
    console.error("An error occurred:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const devicedata_list = async (req, res) => {
  const count = req.body.count;
  const filter = { deviceid: req.body.deviceid };
  try {
    const response = await device_object.findcount_devicedata(filter);
    if (response[0].data == null ? true : false) {
      return res.status(200).json([]);
    } else if (response[0].data.length <= count) {
      return res.status(200).json(response[0].data);
    }
    var arr = [];
    var index = 0;
    for (
      let i = response[0].data.length - 1;
      i >= response[0].data.length - count;
      i--
    ) {
      arr[index] = response[0].data[i];
      index++;
    }
    return res.status(200).json(arr);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "server error" });
  }
};

const devicedata_update = async (req, res) => {
  const data = req.body;
  const { deviceid } = req.body;
  delete data.deviceid;

  const update = { $set: data };
  const filter = { deviceid: deviceid };
  try {
    device_object.data_additon(filter, update);
    res.status(200).json({ message: "devicedata updated" });
  } catch (error) {
    res.status(500).json({ message: "server error" });
  }
};

const device_location = async (req, res) => {
  try {
    const { deviceid, location } = req.body;
    const filter = { deviceid: deviceid };
    const data = {
      $set: {
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
      },
    };

    await device_object.data_update(filter, data);
    console.log("location updated");
    return res.status(200).json({ message: "Location updated" });
  } catch (error) {
    console.log("server error", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const control_create = async (req, res) => {
  const body = req.body;
  const filter = { deviceid: body.deviceid };

  try {
    const existingControls = await device_object.find_controls(filter);

    if (existingControls === null) {
      await device_object.create_controls(filter);
      return res.status(200).json({ message: "controls created" });
    } else {
      return res.status(404).json({ message: "device control already exists" });
    }
  } catch (error) {
    return res.status(500).json({ message: "server error" });
  }
};

const control_automatic = async (req, res) => {
  const body = req.body;
  const filter = { deviceid: body.deviceid };

  try {
    const result = await device_object.find_controls(filter);

    if (result === null) {
      return res.status(404).json({ message: "no deviceid found" });
    }

    const update = {
      $unset: { timeinterval: 1 },
      $set: {
        mode: "automatic",
        water: body.water,
      },
    };

    await device_object.update_controls(filter, update);
    return res.status(200).json({ message: "controls updated" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "server error" });
  }
};

const control_manual = async (req, res) => {
  const body = req.body;
  const filter = { deviceid: body.deviceid };

  try {
    const result = await device_object.find_controls(filter);

    if (result === null) {
      return res.status(404).json({ message: "no deviceid found" });
    }

    const update = {
      $set: { water: body.water, mode: "manual" },
      $unset: { timeinterval: 1 },
    };

    await device_object.update_controls(filter, update);
    return res.status(200).json({ message: "control updated" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "server error" });
  }
};

const control_timeinterval = async (req, res) => {
  const body = req.body;
  const filter = { deviceid: body.deviceid };

  try {
    const result = await device_object.find_controls(filter);

    if (result === null) {
      return res.status(404).json({ message: "no deviceid found" });
    }

    const update = {
      $set: {
        water: body.water,
        mode: "timeinterval",
        timeinterval: body.timeinterval,
      },
    };

    await device_object.update_controls(filter, update);
    return res.status(200).json({ message: "controls updated" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "server error" });
  }
};

module.exports = {
  devicedata_post,
  devicedata_update,
  devicedata_list,
  device_location,
  control_create,
  control_automatic,
  control_manual,
  control_timeinterval,
};
