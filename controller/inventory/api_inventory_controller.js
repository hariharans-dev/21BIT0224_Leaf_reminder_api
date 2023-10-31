const { validationResult } = require("express-validator");
const Inventory_data = require("./inventory_data_controller.js");

const inventory_object = new Inventory_data();

const inventory_post = async (req, res) => {
  try {
    const currentDateTime = new Date(); 
    const body = req.body;
    const data = {
      device: body.device,
      deviceid: body.deviceid,
      created_time: currentDateTime,
    };
    const filter = { deviceid: body.deviceid };

    const result = await inventory_object.find_device(filter);

    if (result == null) {
      try {
        await inventory_object.create_device(data);
        console.log("Device created");
        return res.status(200).json({ message: "Device created" });
      } catch (error) {
        console.error("Error creating device:", error);
        return res.status(500).json({ message: "Server error" });
      }
    } else {
      return res.status(409).json({ message: "Device ID already exists" });
    }
  } catch (error) {
    console.error("An error occurred:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const inventory_find = async (req, res) => {
  try {
    const body = req.body;
    const filter = { device: body.device };

    const result = await inventory_object.find_device(filter);

    console.log("Document search");

    return res.status(200).json(result);
  } catch (error) {
    console.error("An error occurred:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const inventory_list = async (req, res) => {
  try {
    const body = req.body;
    const filter = { device: body.device };

    const result = await inventory_object.findall_device(filter);
    const data = result.map((item) => ({ deviceid: item.deviceid }));

    console.log("Documents search");

    return res.status(200).json(data);
  } catch (error) {
    console.error("An error occurred:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const inventory_update = async (req, res) => {
  const body = req.body;
  const currentDateTime = new Date();
  const filter = { deviceid: body.olddeviceid };
  const data = {
    deviceid: body.newdeviceid,
    device: body.device,
    updated_time: currentDateTime,
  };
  const update = { $set: data };

  try {
    const result = await inventory_object.find_device(filter);

    if (result == null) {
      return res.status(404).json({ message: "No such deviceid" });
    }

    if (body.olddeviceid == body.newdeviceid) {
      filter = { deviceid: body.olddeviceid };
      await inventory_object.update_device(filter, update);
      console.log("Device updated");
      return res.status(200).json({ message: "Device updated" });
    } else {
      filter = { deviceid: body.newdeviceid };
      const existingDevice = await inventory_object.find_device(filter);

      if (existingDevice == null) {
        filter = { deviceid: body.olddeviceid };
        await inventory_object.update_device(filter, update);
        console.log("Device updated");
        return res.status(200).json({ message: "Device updated" });
      } else {
        return res.status(409).json({ message: "Device ID already exists" });
      }
    }
  } catch (error) {
    console.error("An error occurred:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const inventory_delete = async (req, res) => {
  const body = req.body;
  const filter = { deviceid: body.deviceid };

  try {
    const result = await inventory_object.find_device(filter);

    if (result == null) {
      return res.status(404).json({ message: "No device found" });
    }

    console.log("Device deleted");

    try {
      await inventory_object.delete_device(filter);
      console.log("Device deleted");
      return res.status(200).json({ message: "Device deleted" });
    } catch (error) {
      console.error("An error occurred:", error);
      return res.status(500).json({ message: "Server error" });
    }
  } catch (error) {
    console.error("An error occurred:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  inventory_post,
  inventory_delete,
  inventory_list,
  inventory_update,
  inventory_find,
};
