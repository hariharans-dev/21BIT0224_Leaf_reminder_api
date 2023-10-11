const { client, connectToMongoDB } = require("../../model/data_model.js");

connectToMongoDB();
class Login {
  createuser(data) {
    try {
      const collections = client
        .db(process.env.DB_USER)
        .collection(process.env.COLLECTION_USER);
      const currentDateTime = new Date();
      const resutl = collections.insertOne(data, {
        writeConcern: {
          w: "majority", // Use a valid write concern mode here
          wtimeout: 0,
          provenance: "clientSupplied",
        },
      });
      return resutl;
    } catch (error) {
      return error;
    }
  }

  finduser(filter) {
    try {
      const collections = client
        .db(process.env.DB_USER)
        .collection(process.env.COLLECTION_USER);
      const result = collections.findOne(filter, {
        writeConcern: {
          w: "majority", // Use a valid write concern mode here
          wtimeout: 0,
          provenance: "clientSupplied",
        },
      });
      return result;
    } catch (error) {
      return error;
    }
  }

  updateuser(filter, update) {
    const collections = client
      .db(process.env.DB_USER)
      .collection(process.env.COLLECTION_USER);
    try {
      const result = collections.updateOne(filter, update, {
        writeConcern: {
          w: "majority", // Use a valid write concern mode here
          wtimeout: 0,
          provenance: "clientSupplied",
        },
      });
    } catch (error) {
      return error;
    }
  }

  deleteuser(filter) {
    const collections = client
      .db(process.env.DB_USER)
      .collection(process.env.COLLECTION_USER);
    try {
      const result = collections.deleteOne(filter, {
        writeConcern: {
          w: "majority", // Use a valid write concern mode here
          wtimeout: 0,
          provenance: "clientSupplied",
        },
      });
      console.log(`user deleted`);
      return result;
    } catch (error) {
      return error;
    }
  }
}

module.exports = Login;
