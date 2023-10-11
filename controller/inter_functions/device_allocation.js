const Inventory_data = require("../inventory/inventory_data_controller.js");

const inventory_object = new Inventory_data();

async function device_assignment() {
  try {
    const filter = { device: "leaf-reminder" };
    const result = await inventory_object.find_device(filter);
    if (result !== null) {
      const deviceid = result.deviceid;
      const data = { device: "leaf-reminder-assigned" };
      const update = { $set: data };
      const filter = { deviceid: deviceid };
      await inventory_object.update_device(filter, update);
      console.log(deviceid);
      return deviceid;
    } else {
      return null;
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}

module.exports = { device_assignment };
