const { client, connectToMongoDB } = require("../../model/data_model.js");

connectToMongoDB();

class Inventory_data {
  create_device(data) {
    try {
      const collections = client
        .db(process.env.DB_USER)
        .collection(process.env.COLLECTION_INVENTORY);
      collections.insertOne(data);
    } catch (error) {
      return error;
    }
  }

  update_device(filter, update) {
    try {
      const collections = client
        .db(process.env.DB_USER)
        .collection(process.env.COLLECTION_INVENTORY);
      collections.updateOne(filter, update);
    } catch (error) {
      return error;
    }
  }

  find_device(filter) {
    try {
      const collections = client
        .db(process.env.DB_USER)
        .collection(process.env.COLLECTION_INVENTORY);
      const result = collections.findOne(filter);
      return result;
    } catch (error) {
      return error;
    }
  }

  delete_device(filter) {
    try {
      const collections = client
        .db(process.env.DB_USER)
        .collection(process.env.COLLECTION_INVENTORY);
      const result = collections.deleteOne(filter);
      return result;
    } catch (error) {
      return error;
    }
  }

  findall_device(filter) {
    try {
      const collections = client
        .db(process.env.DB_USER)
        .collection(process.env.COLLECTION_INVENTORY);
      const result = collections.find(filter).toArray();
      var data = [];
      for (var i = 0; i < result.length; i++) {
        data[i] = { deviceid: result[i]["deviceid"] };
      }
      return result;
    } catch (error) {
      return error;
    }
  }
}

module.exports = Inventory_data;
