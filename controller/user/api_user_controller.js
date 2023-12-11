const crypto = require("crypto");
const randomUsernameGenerator = require("random-username-generator");

const {
  device_assignment,
} = require("../inter_functions/device_allocation.js");
const { otp_mailer } = require("../inter_functions/otp_mailer.js");
const {
  verification_mailer,
} = require("../inter_functions/verification_mailer.js");
const Login = require("./user_data_controller.js");
const { sendSMS } = require("../inter_functions/sms_otp_sender.js");

const user_object = new Login();

const generateRandomKey = () => {
  const length = 15;
  return crypto.randomBytes(length).toString("hex");
};

const generateusername = () => {
  return randomUsernameGenerator.generate();
};

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
  const newuser = { user: generateusername(), password: generateRandomKey() };
  const byte64 = encode_byte64(newuser.user, newuser.password);
  const filter = { user: newuser.user };

  try {
    const existingUser = await user_object.finduser(filter);

    if (existingUser != null) {
      return res.status(409).json({ message: "user already exists" });
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
        mail_verified: false,
        phone_verified: false,
        default: true,
      };

      try {
        await user_object.createuser(new_user);
        return res
          .status(200)
          .json({ user: newuser.user, password: newuser.password });
      } catch (error) {
        return res.status(500).json({ message: "server error" });
      }
    } else {
      return res.status(404).json({ message: "user not created" });
    }
  } catch (error) {
    console.error("server error");
    return res.status(500).json({ message: "server error" });
  }
};

const user_details = async (req, res) => {
  try {
    const { session_id } = req.body;
    const filter = { session_id };

    const result = await user_object.finduser(filter);
    if (result == null) {
      console.log("user not found");
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({
      user: result.user,
      name: result.name,
      deviceid: result.deviceid,
    });
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
      return res.status(404).json({ message: "user not found" });
    }
    if (result.default && result != null) {
      return res.status(404).json({
        key: result.key,
        default: true,
        message: "user not verified",
      });
    }

    const session_id = generateRandomKey();
    const currentDateTime = new Date();
    const update = {
      $set: { session_id, session_time: currentDateTime },
    };

    try {
      await user_object.updateuser(filter, update);
      console.log("user login");
      return res.status(200).json({ key: result.key, session_id: session_id });
    } catch (error) {
      console.error("server error");
      return res.status(500).json({ message: "Server error" });
    }
  } catch (error) {
    console.error("server error");
    return res.status(500).json({ message: "Server error" });
  }
};

const user_default = async (req, res) => {
  try {
    const { key, user } = req.body;
    const [, password] = decode_byte64(key);
    const filter = { user: user };
    console.log("default", user, password);

    const result = await user_object.finduser(filter);

    if (result == null) {
      return res.status(404).json({ message: "user not found" });
    }
    if (!result.mail_verified) {
      return res.status(404).json({ message: "user not verified" });
    }
    const tempuser = result.tempuser;
    const newkey = encode_byte64(tempuser, password);
    const currentDateTime = new Date();
    const update = {
      $set: { key: newkey, user: tempuser, update: currentDateTime },
      $unset: { tempuser: 1, default: 1 },
    };
    console.log(update);

    try {
      await user_object.updateuser(filter, update);
      return res.status(200).json({ message: "user updated", key: newkey });
    } catch (error) {
      return res.status(500).json({ message: "server error" });
    }
  } catch (error) {
    return res.status(500).json({ message: "server error" });
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
    const { user, key } = req.body;
    var filter = { key: key };
    const currentDateTime = new Date();

    const result = await user_object.finduser(filter);

    if (result == null) {
      return res.status(404).json({ message: "user not found" });
    }

    filter = { user: user };
    var mailresult = await user_object.finduser(filter);

    if (mailresult != null && mailresult.mail_verified) {
      return res.status(409).json({ message: "mail already taken" });
    }
    filter = { tempuser: user };
    mailresult = await user_object.finduser(filter);
    if (mailresult != null && !mailresult.default) {
      return res.status(409).json({ message: "mail already taken" });
    }

    try {
      const verification_key = generateRandomKey();
      const sent_key = encode_byte64(verification_key, key);
      const update = {
        $set: {
          tempuser: user,
          mail_verify_send_time: currentDateTime,
          mail_verification_key: verification_key,
        },
      };
      filter = { key: key };
      await user_object.updateuser(filter, update);
      const url =
        process.env.FRONTEND_DOMAIN +
        "/verify/password?key=" +
        encode_byte64(process.env.EMAIL_VERIFICATION_APIKEY, sent_key);
      console.log(url, "verification", verification_key);
      await verification_mailer(user, url);
      return res.status(200).json({ message: "mail verification sent" });
    } catch (error) {
      return res.status(500).json({ message: "server error" });
    }
  } catch (error) {
    return res.status(500).json({ message: "server error" });
  }
};

const user_getverification_email = async (req, res) => {
  try {
    const { mail_verification_key, key } = req.body;
    const filter = { key: key };
    const currentDateTime = new Date();

    const result = await user_object.finduser(filter);

    if (result == null) {
      return res.status(404).json({ message: "user not found" });
    } else if (result.mail_verification_key !== mail_verification_key) {
      return res.status(404).json({ message: "verification key not matched" });
    }

    const verify_send_time = result.mail_verify_send_time;
    const timedifference = currentDateTime - verify_send_time;
    const seconds = timedifference / 1000;

    const expirehours = Number(process.env.USER_VERIFICATION_EXPIRE_HOURS);
    const expireminutes = expirehours * 60;
    const expireseconds = expireminutes * 60;

    if (result.mail_verified == true) {
      const random_key = generateRandomKey();
      const forget_password_key = encode_byte64(random_key, result.user);
      const update = {
        $set: {
          updated_time: currentDateTime,
          forget_password_key: forget_password_key,
          forget_password_key_send_time: currentDateTime,
        },
      };
    }
    if (seconds < expireseconds) {
      const random_key = generateRandomKey();
      const forget_password_key = encode_byte64(random_key, result.user);
      const update = {
        $unset: {
          mail_verification_key: 1,
          mail_verify_send_time: 1,
        },
        $set: {
          mail_verified: true,
          updated_time: currentDateTime,
          mail_verified_time: currentDateTime,
          forget_password_key: forget_password_key,
          forget_password_key_send_time: currentDateTime,
        },
      };

      try {
        await user_object.updateuser(filter, update);
        return res
          .status(200)
          .json({ forget_password_key: forget_password_key });
      } catch (error) {
        return res.status(500).json({ message: "server error" });
      }
    } else {
      return res.status(409).json({ message: "verification expired" });
    }
  } catch (error) {
    return res.status(500).json({ message: "server error" });
  }
};

const user_sendotp_email = async (req, res) => {
  try {
    const { user } = req.body;
    const filter = { user };
    const currentDateTime = new Date();

    const result = await user_object.finduser(filter);

    if (result == null) {
      return res.status(404).json({ message: "user not found" });
    }

    const otp = generateOTP();
    const update = {
      $set: {
        mail_otp_send_time: currentDateTime,
        mail_otp: otp,
      },
    };

    try {
      await user_object.updateuser(filter, update);
      otp_mailer(user, otp);
      return res.status(200).json({ message: "mail otp sent" });
    } catch (error) {
      return res.status(500).json({ message: "server error" });
    }
  } catch (error) {
    return res.status(500).json({ message: "server error" });
  }
};

const user_verifyotp_email = async (req, res) => {
  try {
    const { user, otp } = req.body;
    const filter = { user: user };

    const result = await user_object.finduser(filter);

    if (result == null) {
      return res.status(404).json({ message: "user not found" });
    }

    if (result.mail_otp != null) {
      if (result.mail_otp === otp) {
        const mail_otp_send_time = result.mail_otp_send_time;
        const currentDateTime = new Date();
        const timedifference = currentDateTime - mail_otp_send_time;
        const seconds = timedifference / 1000;

        const expireminutes = Number(process.env.USER_OTP_EXPIRE_MINUTES);
        const expireseconds = expireminutes * 60;

        if (seconds < expireseconds) {
          const random_key = generateRandomKey();
          const forget_password_key = encode_byte64(user, random_key);
          var update = {
            $unset: {
              mail_otp: 1,
              mail_otp_send_time: 1,
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
            return res.status(500).json({ message: "server error" });
          }
        } else {
          var update = {
            $unset: {
              mail_otp: 1,
              mail_otp_send_time: 1,
            },
          };
          await user_object.updateuser(filter, update);
          return res.status(409).json({ message: "mail otp expired" });
        }
      } else {
        return res.status(404).json({ message: "invalid mail otp" });
      }
    } else {
      return res.status(404).json({ message: "no mail otp generated" });
    }
  } catch (error) {
    return res.status(500).json({ message: "server error" });
  }
};

const user_forgetpassword = async (req, res) => {
  try {
    const { forget_password_key, password } = req.body;
    const filter = { forget_password_key: forget_password_key };

    const result = await user_object.finduser(filter);

    if (result == null) {
      return res.status(404).json({ message: "Forget password key timed out" });
    }

    const forget_password_key_send_time = result.forget_password_key_send_time;
    const currentDateTime = new Date();
    const timedifference = currentDateTime - forget_password_key_send_time;
    const seconds = timedifference / 1000;

    const expireminutes = Number(process.env.USER_FORGETKEY_EXPIRE_MINUTES);
    const expireseconds = expireminutes * 60;

    console.log(seconds, expireseconds);
    if (seconds < expireseconds) {
      const [olduser] = decode_byte64(result.key);
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
        return res
          .status(200)
          .json({ message: "password changed", key: newkey });
      } catch (error) {
        return res.status(500).json({ message: "server error" });
      }
    } else {
      return res.status(409).json({ message: "password change expired" });
    }
  } catch (error) {
    return res.status(500).json({ message: "server error" });
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

const user_sendverification_phone = async (req, res) => {
  try {
    var filter = { key: req.body.key };
    const currentDateTime = new Date();

    const result = await user_object.finduser(filter);

    if (result == null) {
      return res.status(404).json({ message: "no user found" });
    }

    filter = { phone: req.body.phone };
    const phone_result = await user_object.finduser(filter);
    if (phone_result != null) {
      return res.status(409).json({ message: "phone already used" });
    }

    const verification_key = generateRandomKey();
    const key = encode_byte64(verification_key, req.body.phone);
    const keyparam = encode_byte64(process.env.PHONE_VERIFICATION_APIKEY, key);
    const update = {
      $set: {
        phone_verify_send_time: currentDateTime,
        phone_verification_key: verification_key,
      },
    };

    try {
      filter = { key: req.body.key };
      await user_object.updateuser(filter, update);
      const url =
        process.env.API_DOMAIN +
        "/api/users/getverification_phone?key=" +
        keyparam;

      const text =
        "Leaf-Reminder phone verification, Click the link below\n\n" +
        url +
        "\n";
      console.log(url);
      const phone = req.body.phone;
      await sendSMS(phone, text);
      return res.status(200).json({ message: "phone verification sent" });
    } catch (error) {
      console.log("server error");
      return res.status(500).json({ message: "server error" });
    }
  } catch (error) {
    console.log("server error");
    return res.status(500).json({ message: "server error" });
  }
};

const user_getverification_phone = async (req, res) => {
  try {
    const keyParam = req.query.key;
    const [, key] = decode_byte64(keyParam);
    const [verification_key, phone] = decode_byte64(key);
    const filter = { phone_verification_key: verification_key };
    const currentDateTime = new Date();

    const result = await user_object.finduser(filter);

    if (result == null) {
      return res
        .status(404)
        .json({ message: "mail verification key not found" });
    }

    const verify_send_time = result.phone_verify_send_time;
    const timedifference = currentDateTime - verify_send_time;
    const seconds = timedifference / 1000;

    const expirehours = Number(process.env.USER_VERIFICATION_EXPIRE_HOURS);
    const expireminutes = expirehours * 60;
    const expireseconds = expireminutes * 60;

    if (seconds < expireseconds) {
      const update = {
        $unset: {
          phone_verification_key: 1,
          phone_verify_send_time: 1,
        },
        $set: {
          phone_verified: true,
          updated_time: currentDateTime,
          phone_verified_time: currentDateTime,
          phone: phone,
        },
      };

      try {
        await user_object.updateuser(filter, update);
        return res.status(200).json({ message: "phone verified" });
      } catch (error) {
        return res.status(500).json({ message: "server error" });
      }
    } else {
      return res
        .status(409)
        .json({ message: "phone verification key expired" });
    }
  } catch (error) {
    return res.status(500).json({ message: "server error" });
  }
};

const user_sendotp_phone = async (req, res) => {
  try {
    const { phone } = req.body;
    const filter = { phone: phone };
    const currentDateTime = new Date();

    const result = await user_object.finduser(filter);

    if (result == null) {
      return res.status(404).json({ message: "phone not found" });
    }

    const otp = generateOTP();
    const update = {
      $set: {
        phone_otp_send_time: currentDateTime,
        phone_otp: otp,
      },
    };

    try {
      await user_object.updateuser(filter, update);
      const text = "Leaf-Reminder otp\n" + otp + "\n\n";
      sendSMS(phone, text);
      return res.status(200).json({ message: "phone otp sent" });
    } catch (error) {
      return res.status(500).json({ message: "server error" });
    }
  } catch (error) {
    return res.status(500).json({ message: "server error" });
  }
};

const user_verifyotp_phone = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    const filter = { phone: phone };

    const result = await user_object.finduser(filter);

    if (result == null) {
      return res.status(404).json({ message: "phone not found" });
    }

    if (result.phone_otp != null) {
      if (result.phone_otp === otp) {
        const phone_otp_send_time = result.phone_otp_send_time;
        const currentDateTime = new Date();
        const timedifference = currentDateTime - phone_otp_send_time;
        const seconds = timedifference / 1000;

        const expireminutes = Number(process.env.USER_OTP_EXPIRE_MINUTES);
        const expireseconds = expireminutes * 60;

        if (seconds < expireseconds) {
          const random_key = generateRandomKey();
          const forget_password_key = encode_byte64(result.user, random_key);
          var update = {
            $unset: {
              phone_otp: 1,
              phone_otp_send_time: 1,
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
            return res.status(500).json({ message: "server error" });
          }
        } else {
          var update = {
            $unset: {
              phone_otp: 1,
              phone_otp_send_time: 1,
            },
          };
          await user_object.updateuser(filter, update);
          return res.status(409).json({ message: "phone otp expired" });
        }
      } else {
        return res.status(404).json({ message: "invalid phone otp" });
      }
    } else {
      return res.status(404).json({ message: "no phone otp generated" });
    }
  } catch (error) {
    return res.status(500).json({ message: "server error" });
  }
};

module.exports = {
  user_create,
  user_details,
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
  user_default,
};
