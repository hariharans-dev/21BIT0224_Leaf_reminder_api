const { body } = require("express-validator");
const {
  device_assignment,
} = require("../inter_functions/device_allocation.js");
const { otp_mailer } = require("../inter_functions/otp_mailer.js");
const {
  verification_mailer,
} = require("../inter_functions/verification_mailer.js");
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

const user_create = async (req, res) => {
  const newuser = req.body;
  const byte64 = encode_byte64(newuser.user, newuser.password);
  const filter = { user: newuser.user };

  try {
    const existingUser = await user_object.finduser(filter);

    if (existingUser != null) {
      console.log("user exits");
      return res.status(409).json({ message: "User already exists" });
    }
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
        await user_object.createuser(new_user);
        console.log("user created");
        return res.status(200).json({ message: "User created" });
      } catch (error) {
        console.error("server error");
        return res.status(500).json({ message: "Server error" });
      }
    } else {
      return res.status(404).json({ message: "User not created" });
    }
  } catch (error) {
    console.error("server error");
    return res.status(500).json({ message: "Server error" });
  }
};

const user_login = async (req, res) => {
  try {
    const { user, password } = req.body;
    const byte64 = encode_byte64(user, password);
    const filter = { key: byte64 };

    const result = await user_object.finduser(filter);

    if (result == null) {
      console.log("user not found");
      return res.status(404).json({ message: "User not found" });
    }

    const session_id = generateRandomKey();
    const currentDateTime = new Date();
    const update = {
      $set: { session_id, session_time: currentDateTime },
    };

    try {
      await user_object.updateuser(filter, update);
      console.log("user login");
      return res.status(200).json({ key: result.key, session_id });
    } catch (error) {
      console.error("server error");
      return res.status(500).json({ message: "Server error" });
    }
  } catch (error) {
    console.error("server error");
    return res.status(500).json({ message: "Server error" });
  }
};

const user_login_session = async (req, res) => {
  try {
    const { session_id } = req.body;
    console.log(session_id);
    const filter = { session_id };

    const result = await user_object.finduser(filter);

    if (result == null) {
      console.log("session not found");
      return res.status(404).json({ message: "Session not found" });
    }

    const session_time = result.session_time;
    const currentDateTime = new Date();
    const timedifference = currentDateTime - session_time;
    const seconds = timedifference / 1000;

    const expirehours = 24;
    const expireminutes = expirehours * 60;
    const expireseconds = expireminutes * 60;

    console.log(seconds);

    if (seconds < expireseconds) {
      console.log("session authenticated");
      return res
        .status(200)
        .json({ key: result.key, message: "Session authenticated" });
    } else {
      const key = result.key;
      const update = { $unset: { session_id: 1, session_time: 1 } };

      try {
        await user_object.updateuser({ key }, update);
        console.log("session timeout");
        return res.status(409).json({ message: "Session not found" });
      } catch (error) {
        console.error("server error");
        return res.status(500).json({ message: "Server error" });
      }
    }
  } catch (error) {
    console.error("server error");
    return res.status(500).json({ message: "Server error" });
  }
};

const user_update = async (req, res) => {
  const body = req.body;
  const userkey = body.key;
  const filter = { key: userkey };

  try {
    const result = await user_object.finduser(filter);

    if (result == null) {
      console.log("user not found");
      return res.status(404).json({ message: "User not found" });
    }

    const [olduser, oldpassword] = decode_byte64(userkey);
    const update_data = body;

    if (body.user != null) {
      const userFilter = { user: body.user };

      try {
        const existingUser = await user_object.finduser(userFilter);

        if (existingUser != null) {
          console.log("user exits");
          return res.status(409).json({ message: "User already exists" });
        }

        const key = encode_byte64(body.user, oldpassword);
        update_data.key = key;
        update_data.verified = false;
      } catch (error) {
        console.log("server error");
        return res.status(500).json({ message: "Server error" });
      }
    }

    const currentDateTime = new Date();
    update_data.updated_time = currentDateTime;
    const update = { $set: update_data };
    const filter1 = { key: userkey };

    try {
      await user_object.updateuser(filter1, update);
      console.log("user updated");
      return res.status(200).json({ message: "User updated" });
    } catch (error) {
      console.log("server error");
      return res.status(500).json({ message: "Server error" });
    }
  } catch (error) {
    console.log("server error");
    return res.status(500).json({ message: "Server error" });
  }
};

const user_delete = async (req, res) => {
  try {
    const { key } = req.body;
    const filter = { key };

    const result = await user_object.finduser(filter);

    if (result == null) {
      console.log("user not found");
      return res.status(404).json({ message: "User not found" });
    }

    try {
      await user_object.deleteuser(filter);
      console.log("user deleted");
      return res
        .status(200)
        .json({ message: "User deleted", user: result.user });
    } catch (error) {
      console.log("server error");
      return res.status(500).json({ message: "Server error" });
    }
  } catch (error) {
    console.log("server error");
    return res.status(500).json({ message: "Server error" });
  }
};

const user_sendverification_email = async (req, res) => {
  try {
    const filter = { key: req.body.key };
    const currentDateTime = new Date();

    const result = await user_object.finduser(filter);

    if (result == null) {
      console.log("user not found");
      return res.status(404).json({ message: "User not found" });
    }

    if (result.verified === true) {
      console.log("user already verified");
      return res.status(409).json({ message: "User already verified" });
    }

    const verification_key = generateRandomKey();
    const update = {
      $set: {
        verify_send_time: currentDateTime,
        verification_key: verification_key,
      },
    };

    try {
      await user_object.updateuser(filter, update);
      const url =
        process.env.API_DOMAIN +
        "/api/users/getverification?key=" +
        encode_byte64(process.env.EMAIL_VERIFICATION_APIKEY, verification_key);
      verification_mailer(result.user, url);
      console.log("verification sent");
      return res.status(200).json({ verification_key });
    } catch (error) {
      console.log("server error");
      return res.status(500).json({ message: "Server error" });
    }
  } catch (error) {
    console.log("server error");
    return res.status(500).json({ message: "Server error" });
  }
};

const user_getverification_email = async (req, res) => {
  try {
    const keyParam = req.query.key;
    const [apikey, verification_key] = decode_byte64(keyParam);
    console.log(verification_key);
    const filter = { verification_key: verification_key };
    const currentDateTime = new Date();

    const result = await user_object.finduser(filter);

    if (result == null) {
      console.log("verification key not found");
      return res.status(404).json({ message: "Verification key not found" });
    }

    const verify_send_time = result.verify_send_time;
    const timedifference = currentDateTime - verify_send_time;
    const seconds = timedifference / 1000;

    const expirehours = Number(process.env.USER_VERIFICATION_EXPIRE_HOURS);
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
        await user_object.updateuser(filter, update);
        console.log("user verified");
        return res.status(200).json({ message: "User verified" });
      } catch (error) {
        console.log("server error");
        return res.status(500).json({ message: "Server error" });
      }
    } else {
      console.log("verification key expired");
      return res.status(409).json({ message: "Verification key expired" });
    }
  } catch (error) {
    console.log("server error");
    return res.status(500).json({ message: "Server error" });
  }
};

const user_sendotp_email = async (req, res) => {
  try {
    const { user } = req.body;
    const filter = { user };
    const currentDateTime = new Date();

    const result = await user_object.finduser(filter);

    if (result == null) {
      console.log("user not found");
      return res.status(404).json({ message: "User not found" });
    }

    const otp = generateOTP();
    const update = {
      $set: {
        otp_send_time: currentDateTime,
        otp,
      },
    };

    try {
      await user_object.updateuser(filter, update);
      console.log("user otp sent");
      otp_mailer(user, otp);
      return res.status(200).json({ otp });
    } catch (error) {
      console.log("server error");
      return res.status(500).json({ message: "Server error" });
    }
  } catch (error) {
    console.log("server error");
    return res.status(500).json({ message: "Server error" });
  }
};

const user_verifyotp_email = async (req, res) => {
  try {
    const { user, otp } = req.body;
    const filter = { user };

    const result = await user_object.finduser(filter);

    if (result == null) {
      console.log("user not found");
      return res.status(404).json({ message: "User not found" });
    }

    if (result.otp != null) {
      if (result.otp === otp) {
        const otp_send_time = result.otp_send_time;
        const currentDateTime = new Date();
        const timedifference = currentDateTime - otp_send_time;
        const seconds = timedifference / 1000;

        const expireminutes = Number(process.env.USER_OTP_EXPIRE_MINUTES);
        const expireseconds = expireminutes * 60;

        if (seconds < expireseconds) {
          const random_key = generateRandomKey();
          const forget_password_key = encode_byte64(user, random_key);
          const update = {
            $unset: {
              otp: 1,
              otp_send_time: 1,
            },
            $set: {
              forget_password_key,
              forget_password_key_send_time: currentDateTime,
            },
          };

          try {
            await user_object.updateuser(filter, update);
            return res.status(200).json({ forget_password_key });
          } catch (error) {
            console.log("server error");
            return res.status(500).json({ message: "Server error" });
          }
        } else {
          console.log("otp expired");
          return res.status(409).json({ message: "OTP expired" });
        }
      } else {
        console.log("invalid otp");
        return res.status(404).json({ message: "Invalid OTP" });
      }
    } else {
      console.log("otp not generated");
      return res.status(404).json({ message: "No OTP generated" });
    }
  } catch (error) {
    console.log("server error");
    return res.status(500).json({ message: "Server error" });
  }
};

const user_forgetpassword = async (req, res) => {
  try {
    const { forget_password_key, password } = req.body;
    const filter = { forget_password_key };

    const result = await user_object.finduser(filter);

    if (result == null) {
      console.log("no forgetkey found");
      return res.status(404).json({ message: "Forget password key timed out" });
    }

    const forget_password_key_send_time = result.forget_password_key_send_time;
    const currentDateTime = new Date();
    const timedifference = currentDateTime - forget_password_key_send_time;
    const seconds = timedifference / 1000;

    const expireminutes = Number(process.env.USER_FORGETKEY_EXPIRE_MINUTES);
    const expireseconds = expireminutes * 60;

    if (seconds < expireseconds) {
      const [olduser, oldpassword] = decode_byte64(result.key);
      const newkey = encode_byte64(olduser, password);
      const update = {
        $set: { key: newkey },
        $unset: {
          forget_password_key: 1,
          forget_password_key_send_time: 1,
        },
      };
      const update_filter = { key: result.key };

      try {
        await user_object.updateuser(update_filter, update);
        console.log("password changed");
        return res.status(200).json({ message: "Password changed" });
      } catch (error) {
        console.log("server error");
        return res.status(500).json({ message: "Server error" });
      }
    } else {
      console.log("forget password key expired");
      return res.status(409).json({ message: "Forget password key expired" });
    }
  } catch (error) {
    console.log("server error");
    return res.status(500).json({ message: "Server error" });
  }
};

const user_changepassword = async (req, res) => {
  try {
    const { key, oldpassword, password } = req.body;
    const filter = { key };

    const result = await user_object.finduser(filter);

    if (result == null) {
      console.log("user not found");
      return res.status(404).json({ message: "No user found" });
    }

    const [original_old_user, original_old_password] = decode_byte64(key);

    if (original_old_password === oldpassword) {
      try {
        const newkey = encode_byte64(original_old_user, password);
        const update = { $set: { key: newkey } };
        const update_filter = { key };

        await user_object.updateuser(update_filter, update);
        console.log("password changed");
        return res.status(200).json({ message: "Password changed" });
      } catch (error) {
        console.log("server error");
        return res.status(500).json({ message: "Server error" });
      }
    } else {
      console.log("invalid old password");
      return res.status(409).json({ message: "Invalid old password" });
    }
  } catch (error) {
    console.log("server error");
    return res.status(500).json({ message: "Server error" });
  }
};

const user_location = async (req, res) => {
  try {
    const { key, location } = req.body;
    const filter = { key };
    const data = {
      $set: {
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
      },
    };

    await user_object.updateuser(filter, data);
    console.log("location updated");
    return res.status(200).json({ message: "Location updated" });
  } catch (error) {
    console.log("server error");
    return res.status(500).json({ message: "Server error" });
  }
};

const user_sendverification_phone = (req, res) => {};

const user_getverification_phone = (req, res) => {};

const user_sendotp_phone = (req, res) => {};

const user_verifyotp_phone = (req, res) => {};

module.exports = {
  user_create,
  user_login,
  user_login_session,
  user_update,
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
  user_location,
};
