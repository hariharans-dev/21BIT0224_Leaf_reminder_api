const { validationResult } = require("express-validator");
const Device_data = require("./device_data_controller.js");

const device_object = new Device_data();

function encode_byte64(user, password) {
  const credentials = `${user}:${password}`;
  const base64Credentials = Buffer.from(credentials).toString("base64");
  return base64Credentials;
}

function decode_byte64(base64Credentials) {
  const decodedCredentials = Buffer.from(base64Credentials, "base64").toString(
    "utf-8"
  );
  const [user, password] = decodedCredentials.split(":");
  return [user, password];
}

const devicedata_post = (req, res) => {
  const authHeader = req.headers["authorization"];

  const [authType, apiKey] = authHeader.split(" ");

  const [key, deviceid] = decode_byte64(apiKey);
  const body = req.body;
  const currentDateTime = new Date();

  const filter = { deviceid: deviceid };
  var data = {
    deviceid: deviceid,
    data: [
      {
        time: currentDateTime,
        soilmoisture: body.soilmoisture,
        temperature: body.temperature,
      },
    ],
  };
  try {
    device_object.findone_devicedata(filter).then((result) => {
      if (result == null) {
        try {
          device_object.createdata_devicedata(data);
          console.log("created device for the first time");
        } catch {
          return res.status(500).json({ message: "server error" });
        }
      } else {
        data = {
          time: currentDateTime,
          soilmoisture: body.soilmoisture,
          temperature: body.temperature,
        };
        try {
          const update = {
            $push: { data: data },
          };
          device_object.data_additon(filter, update);
          console.log("inserted data from already created deviceid");
        } catch (error) {
          return res.status(500).json({ message: "server error" });
        }
      }
      try {
        device_object.find_controls(filter).then((result) => {
          if (result == null) {
            return res.status(404).json({ message: "no deviceid found" });
          } else {
            if (result.mode == "manual") {
              try {
                const update = {
                  $set: {
                    mode: "automatic",
                    water: result.water,
                    time: currentDateTime,
                  },
                };
                device_object.update_controls(filter, update);
                return res.status(200).json({
                  mode: "manual",
                  water: result.water,
                  message: "data added",
                });
              } catch (error) {
                return res.status(500).json({ message: "server error" });
              }
            } else if (result.mode == "automatic") {
              //not done with the logic yet automatic
              console.log(body);

              return res.status(200).json({
                mode: "automatic",
                message: "data added",
                mode: "automatic",
              });
            } else {
              const timeinterval = result.timeinterval;
              const lasttime = result.time;
              const currentDateTime = new Date();
              const timedifference = currentDateTime - lasttime;
              const betweentime = timedifference / (1000 * 60);
              console.log(betweentime);
              if (betweentime >= timeinterval) {
                try {
                  const update = { $set: { time: currentDateTime } };
                  device_object.update_controls(filter, update);
                  return res.status(200).json({
                    mode: "timeinterval",
                    water: result.water,
                    message: "data added",
                  });
                } catch (error) {
                  return res.status(500).json({ message: "server error" });
                }
              } else {
                return res.status(200).json({
                  message: "data added",
                });
              }
            }
          }
        });
      } catch (error) {
        return res.status(500).json({ message: "server error" });
      }
    });
  } catch (error) {
    console.log("error");
    return res.status(500).json({ message: "server error" });
  }
};

const control_create = (req, res) => {
  const body = req.body;
  const filter = { deviceid: body.deviceid };
  try {
    device_object.create_controls(filter);
    return res.status(200).json({ message: "controls created" });
  } catch (error) {
    return res.status(500).json({ message: "server error" });
  }
};

const control_automatic = (req, res) => {
  const body = req.body;
  const filter = { deviceid: body.deviceid };
  try {
    device_object.find_controls(filter).then((result) => {
      if (result == null) {
        return res.status(404).json({ message: "no deviceid found" });
      } else {
        try {
          var update = {
            $unset: { timeinterval: 1 },
            $set: {
              mode: "automatic",
              water: body.water,
            },
          };

          device_object.update_controls(filter, update);
          return res.status(200).json({ message: "controls updated" });
        } catch (error) {
          console.log(error);
          return res.status(500).json({ message: "server error" });
        }
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "server error" });
  }
};

const control_manual = (req, res) => {
  const body = req.body;
  const filter = { deviceid: body.deviceid };
  try {
    device_object.find_controls(filter).then((result) => {
      if (result == null) {
        return res.status(404).json({ message: "no deviceid found" });
      } else {
        const update = {
          $set: { water: body.water, mode: "manual" },
          $unset: { timeinterval: 1 },
        };
        try {
          device_object.update_controls(filter, update);
          return res.status(200).json({ message: "control updated" });
        } catch (error) {
          return res.status(500).json({ message: "server error" });
        }
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "server error" });
  }
};

const control_timeinterval = (req, res) => {
  const body = req.body;
  const filter = { deviceid: body.deviceid };
  try {
    device_object.find_controls(filter).then((result) => {
      if (result == null) {
        return res.status(404).json({ message: "no deviceid found" });
      } else {
        const update = {
          $set: {
            water: body.water,
            mode: "timeinterval",
            timeinterval: body.timeinterval,
          },
        };
        try {
          device_object.update_controls(filter, update);
          return res.status(200).json({ message: "controls updated" });
        } catch (error) {
          return res.status(500).json({ message: "server error" });
        }
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "server error" });
  }
};

module.exports = {
  devicedata_post,
  control_create,
  control_automatic,
  control_manual,
  control_timeinterval,
};
