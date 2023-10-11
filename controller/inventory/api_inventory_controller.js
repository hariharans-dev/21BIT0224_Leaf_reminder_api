const { validationResult } = require("express-validator");
const Inventory_data = require("./inventory_data_controller.js");

const inventory_object = new Inventory_data();

const inventory_post = (req, res) => {
  const currentDateTime = new Date();
  const body = req.body;
  const data = {
    device: body.device,
    deviceid: body.deviceid,
    created_time: currentDateTime,
  };
  const filter = { deviceid: body.deviceid };
  try {
    inventory_object.find_device(filter).then((result) => {
      if (result == null) {
        try {
          inventory_object.create_device(data);
          console.log("device created");
          return res.status(200).json({ message: "device created" });
        } catch (error) {
          return res.status(500).json({ message: "server error" });
        }
      } else {
        return res.status(409).json({ message: "deviceid already exists" });
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "server error" });
  }
};

const inventory_find = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "not in proper format" });
  }
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res
      .status(401)
      .json({ message: "authorization header is missing." });
  }
  const [authType, apiKey] = authHeader.split(" ");
  if (authType !== "Bearer") {
    return res
      .status(400)
      .json({ message: "invalid Authorization header format." });
  }
  if (apiKey !== process.env.INVENTORY_APIKEY && apiKey !== ADMIN_APIKEY) {
    return res.status(401).json({ message: "invalid Authorization" });
  } else {
    const body = req.body;
    const filter = { device: body.device };
    try {
      inventory_object.find_device(filter).then((result) => {
        console.log("document search");
        return res.status(200).json(result);
      });
    } catch (error) {
      return res.status(500).json({ message: "server error" });
    }
  }
};

const inventory_list = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "not in proper format" });
  }
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    console.log("no authorisation");
    return res
      .status(401)
      .json({ message: "authorization header is missing." });
  }
  const [authType, apiKey] = authHeader.split(" ");
  if (authType !== "Bearer") {
    console.log("invalid authorization header");
    return res
      .status(400)
      .json({ message: "invalid Authorization header format." });
  }
  if (apiKey !== process.env.INVENTORY_APIKEY && apiKey !== ADMIN_APIKEY) {
    return res.status(401).json({ message: "invalid Authorization" });
  } else {
    const body = req.body;
    const filter = { device: body.device };
    try {
      inventory_object.findall_device(filter).then((result) => {
        var data = [];
        for (var i = 0; i < result.length; i++) {
          data[i] = { deviceid: result[i].deviceid };
        }
        console.log("documents search");
        return res.status(200).json(data);
      });
    } catch (error) {
      return res.status(500).json({ message: "server error" });
    }
  }
};

const inventory_update = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "not in proper format" });
  }
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    console.log("no authorisation");
    return res
      .status(401)
      .json({ message: "authorization header is missing." });
  }
  const [authType, apiKey] = authHeader.split(" ");
  if (authType !== "Bearer") {
    console.log("invalid authorization header");
    return res
      .status(400)
      .json({ message: "invalid Authorization header format." });
  }
  if (apiKey !== process.env.INVENTORY_APIKEY && apiKey !== ADMIN_APIKEY) {
    return res.status(401).json({ message: "invalid Authorization" });
  } else {
    const body = req.body;
    const currentDateTime = new Date();
    var filter = { deviceid: body.olddeviceid };
    var data = {
      deviceid: body.newdeviceid,
      device: body.device,
      updated_time: currentDateTime,
    };
    var update = { $set: data };
    try {
      inventory_object.find_device(filter).then((result) => {
        if (result == null) {
          return res.status(404).json({ message: "no such deviceid" });
        } else {
          if (body.olddeviceid == body.newdeviceid) {
            try {
              filter = { deviceid: body.olddeviceid };
              inventory_object.update_device(filter, update);
              console.log("device updated");
              return res.status(200).json({ message: "device updated" });
            } catch (error) {
              return res.status(500).json({ message: "server error" });
            }
          } else {
            try {
              filter = { deviceid: body.newdeviceid };
              inventory_object.find_device(filter).then((result) => {
                if (result == null) {
                  try {
                    filter = { deviceid: body.olddeviceid };
                    inventory_object.update_device(filter, update);
                    console.log("device updated");
                    return res.status(200).json({ message: "device updated" });
                  } catch (error) {
                    return res.status(500).json({ message: "server error" });
                  }
                } else {
                  return res
                    .status(404)
                    .json({ message: "deviceid already exists" });
                }
              });
            } catch (error) {
              return res.status(500).json({ message: "server error" });
            }
          }
        }
      });
    } catch (error) {
      return res.status(500).json({ message: "server error" });
    }
  }
};

const inventory_delete = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "not in proper format" });
  }
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    console.log("no authorisation");
    return res
      .status(401)
      .json({ message: "authorization header is missing." });
  }
  const [authType, apiKey] = authHeader.split(" ");
  if (authType !== "Bearer") {
    console.log("invalid authorization header");
    return res
      .status(400)
      .json({ message: "invalid Authorization header format." });
  }
  if (apiKey !== process.env.INVENTORY_APIKEY && apiKey !== ADMIN_APIKEY) {
    return res.status(401).json({ message: "invalid Authorization" });
  } else {
    const body = req.body;
    const filter = { deviceid: body.deviceid };
    try {
      inventory_object.find_device(filter).then((result) => {
        if (result == null) {
          return res.status(404).json({ message: "no device found" });
        } else {
          console.log("device deleted");
          try {
            inventory_object.delete_device(filter);
            console.log("device deleted");
            return res.status(200).json({ message: "device deleted" });
          } catch (error) {
            return res.status(500).json({ message: "server error" });
          }
        }
      });
    } catch (error) {
      return res.status(500).json({ message: "server error" });
    }
  }
};

module.exports = {
  inventory_post,
  inventory_delete,
  inventory_list,
  inventory_update,
  inventory_find,
};
