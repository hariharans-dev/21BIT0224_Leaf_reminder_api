const { body } = require("express-validator");
const {
  device_assignment,
} = require("../inter_functions/device_allocation.js");
const Login = require("./user_data_controller.js");
const crypto = require("crypto");

const user_object = new Login();

function generateRandomKey() {
  const length = 15;
  return crypto.randomBytes(length).toString("hex");
}

function generateOTP() {
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp.toString();
}

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

const user_post = (req, res) => {
  const newuser = req.body;
  const byte64 = encode_byte64(newuser.user, newuser.password);
  const filter = { user: newuser.user };
  try {
    user_object.finduser(filter).then((value) => {
      if (value == null) {
        console.log("no duplication");
        (async () => {
          try {
            const deviceId = await device_assignment();
            if (deviceId !== null) {
              const currentDateTime = new Date();
              const new_user = {
                user: newuser.user,
                name: newuser.name,
                key: byte64,
                created_time: currentDateTime,
                deviceid: deviceId,
                verified: false,
              };
              try {
                user_object.createuser(new_user);
                console.log("user created");
                res.status(201).json({ message: "user created" });
              } catch (error) {
                console.log("error");
                return res.status(500).json({ message: "server error" });
              }
            } else {
              res.status(404).json({ message: "user not created" });
            }
          } catch (error) {
            console.error("An error occurred:");
            return res.status(500).json({ message: "server error" });
          }
        })();
      } else {
        console.log("duplication");
        return res.status(409).json({ message: "user already exits" });
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "server error" });
  }
};

const user_get = (req, res) => {
  const body = req.body;
  const byte64 = encode_byte64(body.user, body.password);
  const filter = { key: byte64 };
  try {
    user_object.finduser(filter).then((result) => {
      if (result == null) {
        return res.status(404).json({ message: "user not found" });
      } else {
        const filter = { key: result.key };
        const session_id = generateRandomKey();
        const currentDateTime = new Date();
        const update = {
          $set: { session_id: session_id, session_time: currentDateTime },
        };
        try {
          user_object.updateuser(filter, update);
        } catch (error) {
          return res.status(500).json({ message: "server error" });
        }
        return res
          .status(200)
          .json({ key: result.key, session_id: session_id });
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "server error" });
  }
};

const user_get_session = (req, res) => {
  const body = req.body;
  console.log(body);
  const filter = { session_id: body.session_id };
  try {
    user_object.finduser(filter).then((result) => {
      if (result == null) {
        return res.status(404).json({ message: "session not found" });
      } else {
        const session_time = result.session_time;
        const currentDateTime = new Date();
        const timedifference = currentDateTime - session_time;
        const seconds = timedifference / 1000;
        console.log(seconds);
        const expirehours = 24;
        const expireminutes = expirehours * 60;
        const expireseconds = expireminutes * 60;
        console.log(seconds);
        if (seconds < expireseconds) {
          return res.status(200).json({ message: "session authenticated" });
        } else {
          const filter = { key: result.key };
          const update = { $unset: { session_id: 1, session_time: 1 } };
          try {
            user_object.updateuser(filter, update);
            return res.status(409).json({ message: "session not found" });
          } catch (error) {
            return res.status(500).json({ message: "server error" });
          }
        }
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "server error" });
  }
};

const user_put = (req, res) => {
  const body = req.body;
  var userkey = body.key;
  var filter = { key: userkey };
  try {
    user_object.finduser(filter).then((result) => {
      if (result == null) {
        console.log("user not found");
        return res.status(404).json({ message: "user not found" });
      } else {
        [olduser, oldpassword] = decode_byte64(userkey);
        var update_data = body;
        if (body.user != null) {
          filter = { user: body.user };
          user_object.finduser(filter).then((result) => {
            if (result != null) {
              return res.status(409).json({ message: "user already exits" });
            }
          });
          const key = encode_byte64(body.user, oldpassword);
          update_data.key = key;
          update_data.verified = false;
        }
        const currentDateTime = new Date();
        update_data.updated_time = currentDateTime;
        const update = { $set: update_data };
        const filter1 = { key: userkey };
        try {
          user_object.updateuser(filter1, update);
          return res.status(200).json({ message: "user updated" });
        } catch {
          return res.status(500).json({ message: "server error" });
        }
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "server error" });
  }
};

const user_delete = (req, res) => {
  const body = req.body;
  const filter = { key: body.key };
  try {
    user_object.finduser(filter).then((result) => {
      if (result == null) {
        console.log("no user found");
        return res.status(404).json({ message: "user not found" });
      } else {
        try {
          user_object.deleteuser(filter);
          console.log("user deleted");
          return res
            .status(200)
            .json({ message: "user deleted", user: result.user });
        } catch (error) {
          return res.status(500).json({ message: "server error" });
        }
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "server error" });
  }
};

const user_sendverification_email = (req, res) => {
  const filter = { key: req.body.key };
  try {
    const currentDateTime = new Date();
    user_object.finduser(filter).then((result) => {
      if (result == null) {
        return res.status(404).json({ message: "user not found" });
      } else {
        if (result.verified == true) {
          return res.status(409).json({ message: "user already verified" });
        }
        const verification_key = generateRandomKey();
        const update = {
          $set: {
            verify_send_time: currentDateTime,
            verification_key: verification_key,
          },
        };
        try {
          user_object.updateuser(filter, update);
        } catch (error) {
          return res.status(500).json({ message: "server error" });
        }
        return res.status(200).json({ verification_key: verification_key });
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "server error" });
  }
};

const user_getverification_email = (req, res) => {
  const filter = { verification_key: req.body.verification_key };
  try {
    user_object.finduser(filter).then((result) => {
      if (result == null) {
        return res.status(404).json({ message: "verification key not found" });
      } else {
        const verify_send_time = result.verify_send_time;
        const currentDateTime = new Date();
        const timedifference = currentDateTime - verify_send_time;
        const seconds = timedifference / 1000;
        console.log(seconds);
        const expirehours = 6;
        const expireminutes = expirehours * 60;
        const expireseconds = expireminutes * 60;
        if (seconds < expireseconds) {
          const update = {
            $unset: {
              verification_key: 1,
              verify_send_time: 1,
            },
            $set: {
              verified: true,
              updated_time: currentDateTime,
              verified_time: currentDateTime,
            },
          };
          try {
            user_object.updateuser(filter, update);
            return res.status(200).json({ message: "user verified" });
          } catch (error) {
            return res.status(500).json({ message: "server error" });
          }
        } else {
          return res.status(409).json({ message: "verification key expired" });
        }
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "server error" });
  }
};

const user_sendotp_email = (req, res) => {
  const filter = { user: req.body.user };
  try {
    const currentDateTime = new Date();
    user_object.finduser(filter).then((result) => {
      if (result == null) {
        return res.status(404).json({ message: "user not found" });
      } else {
        const otp = generateOTP();
        const update = {
          $set: {
            otp_send_time: currentDateTime,
            otp: otp,
          },
        };
        try {
          user_object.updateuser(filter, update);
        } catch (error) {
          return res.status(500).json({ message: "server error" });
        }
        return res.status(200).json({ otp: otp });
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "server error" });
  }
};

const user_verifyotp_email = (req, res) => {
  const filter = { user: req.body.user };
  try {
    user_object.finduser(filter).then((result) => {
      if (result == null) {
        return res.status(404).json({ message: "no user not found" });
      } else {
        if (result.otp != null) {
          if (result.otp === req.body.otp) {
            const otp_send_time = result.otp_send_time;
            const currentDateTime = new Date();
            const timedifference = currentDateTime - otp_send_time;
            const seconds = timedifference / 1000;
            console.log(seconds);
            const expireminutes = 2.5;
            const expireseconds = expireminutes * 60;
            if (seconds < expireseconds) {
              const random_key = generateRandomKey();
              const forget_password_key = encode_byte64(body.user, random_key);
              const update = {
                $unset: {
                  otp: 1,
                  otp_send_time: 1,
                },
                $set: {
                  forget_password_key: forget_password_key,
                  forget_password_key_send_time: currentDateTime,
                },
              };
              try {
                user_object.updateuser(filter, update);
                return res
                  .status(200)
                  .json({ forget_password_key: forget_password_key });
              } catch (error) {
                return res.status(500).json({ message: "server error" });
              }
            } else {
              return res.status(409).json({ message: "otp expired" });
            }
          } else {
            return res.status(409).json({ message: "invalid otp" });
          }
        } else {
          return res.status(409).json({ message: "no otp generated" });
        }
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "server error" });
  }
};

const user_forgetpassword = (req, res) => {
  const body = req.body;
  const filter = { forget_password_key: body.forget_password_key };
  try {
    user_object.finduser(filter).then((result) => {
      if (result == null) {
        return res.status(404).json({ message: "forget password timed out" });
      } else {
        const forget_password_key_send_time =
          result.forget_password_key_send_time;
        const currentDateTime = new Date();
        const timedifference = currentDateTime - forget_password_key_send_time;
        const seconds = timedifference / 1000;
        console.log(seconds);
        const expireminutes = 2;
        const expireseconds = expireminutes * 60;
        if (seconds < expireseconds) {
          const [olduser, oldpassword] = decode_byte64(result.key);
          const newkey = encode_byte64(olduser, body.password);
          const update = {
            $set: { key: newkey },
            $unset: {
              forget_password_key: 1,
              forget_password_key_send_time: 1,
            },
          };
          const update_filter = { key: result.key };
          try {
            user_object.updateuser(update_filter, update);
            return res.status(200).json({ message: "password changed" });
          } catch (error) {
            return res.status(500).json({ message: "server error" });
          }
        } else {
          return res
            .status(409)
            .json({ message: "forget_password_key expired" });
        }
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "server error" });
  }
};

const user_changepassword = (req, res) => {
  const body = req.body;
  try {
    const filter = { key: body.key };
    user_object.finduser(filter).then((result) => {
      if (result == null) {
        return res.status(404).json({ message: "no user not found" });
      } else {
        const [original_old_user, original_old_password] = decode_byte64(
          body.key
        );
        if (original_old_password == body.oldpassword) {
          try {
            const newkey = encode_byte64(original_old_user, body.password);
            const update = { $set: { key: newkey } };
            const update_filter = { key: body.key };
            user_object.updateuser(update_filter, update);
            return res.status(200).json({ message: "password changed" });
          } catch (error) {
            return res.status(500).json({ message: "server error" });
          }
        } else {
          return res.status(409).json({ message: "invalid oldpassword" });
        }
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "server error" });
  }
};

const user_sendverification_phone = (req, res) => {};

const user_getverification_phone = (req, res) => {};

const user_sendotp_phone = (req, res) => {};

const user_verifyotp_phone = (req, res) => {};

module.exports = {
  user_post,
  user_get,
  user_get_session,
  user_put,
  user_delete,
  user_sendverification_email,
  user_getverification_email,
  user_sendotp_email,
  user_verifyotp_email,
  user_sendverification_phone,
  user_getverification_phone,
  user_sendotp_phone,
  user_verifyotp_phone,
  user_forgetpassword,
  user_changepassword,
};
