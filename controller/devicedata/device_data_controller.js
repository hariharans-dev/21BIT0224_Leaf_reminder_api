const { client, connectToMongoDB } = require("../../model/data_model.js");

connectToMongoDB();

class Device_data {
  createdata_devicedata(data) {
    try {
      const collections = client
        .db(process.env.DB_USER)
        .collection(process.env.COLLECTION_DEVICEDATA);
      const result = collections.insertOne(data);
      return result;
    } catch (error) {
      return error;
    }
  }

  data_additon(filter, update) {
    try {
      const collections = client
        .db(process.env.DB_USER)
        .collection(process.env.COLLECTION_DEVICEDATA);
      const result = collections.updateOne(filter, update);
      return result;
    } catch (error) {
      return error;
    }
  }

  findone_devicedata(filter) {
    try {
      const collections = client
        .db(process.env.DB_USER)
        .collection(process.env.COLLECTION_DEVICEDATA);
      const result = collections.findOne(filter);
      return result;
    } catch (error) {
      return error;
    }
  }
  findcount_devicedata(filter, count) {
    try {
      const collections = client
        .db(process.env.DB_USER)
        .collection(process.env.COLLECTION_DEVICEDATA);
      const results = collections.find(filter).limit(count).toArray();
      return results;
    } catch (error) {
      return error;
    }
  }

  create_controls(filter) {
    try {
      const currentDateTime = new Date();
      const data = {
        deviceid: filter.deviceid,
        water: 100,
        mode: "automatic",
        time: currentDateTime,
      };
      const collections = client
        .db(process.env.DB_USER)
        .collection(process.env.COLLECTION_CONTROLS);
      const result = collections.insertOne(data);
      return result;
    } catch (error) {
      return error;
    }
  }

  find_controls(filter) {
    try {
      const collections = client
        .db(process.env.DB_USER)
        .collection(process.env.COLLECTION_CONTROLS);
      const result = collections.findOne(filter);
      return result;
    } catch (error) {
      return error;
    }
  }

  update_controls(filter, update) {
    try {
      const collections = client
        .db(process.env.DB_USER)
        .collection(process.env.COLLECTION_CONTROLS);
      collections.updateOne(filter, update);
    } catch (error) {
      return error;
    }
  }
}

module.exports = Device_data;
