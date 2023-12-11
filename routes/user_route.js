const router = require("express").Router();
const { check, validationResult } = require("express-validator");

const {
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
  user_forgetpassword,
  user_changepassword,
  user_sendverification_phone,
  user_getverification_phone,
  user_sendotp_phone,
  user_verifyotp_phone,
  user_default,
} = require("../controller/user/api_user_controller.js");

const verifyTokenuser = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    console.log("no authorisation");
    return res
      .status(400)
      .json({ message: "authorization header is missing." });
  }
  const [authType, apiKey] = authHeader.split(" ");
  if (authType !== "Bearer") {
    console.log("invalid authorization header");
    return res
      .status(400)
      .json({ message: "invalid Authorization header format." });
  }
  if (
    apiKey !== process.env.LOGIN_APIKEY &&
    apiKey !== process.env.ADMIN_APIKEY
  ) {
    return res.status(401).json({ message: "invalid Authorization" });
  }
  next();
};

const decode_byte64 = (base64Credentials) => {
  const decodedCredentials = Buffer.from(base64Credentials, "base64").toString(
    "utf-8"
  );
  const [user, password] = decodedCredentials.split(":");
  return [user, password];
};

const validateRequestBody_create = [];
const create_middleware = [validateRequestBody_create, verifyTokenuser];
router.post("/create", create_middleware, user_create);

const validateRequestBody_details = [
  (req, res, next) => {
    const numberOfFields = Object.keys(req.body).length;
    if (numberOfFields == 0) {
      return res.status(400).json({ message: "no feild given" });
    }
    next();
  },
  check("session_id").exists().isString(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "not in proper format" });
    }
    next();
  },
];
const details_middleware = [validateRequestBody_details, verifyTokenuser];
router.post("/details", details_middleware, user_details);

const validateRequestBody_login = [
  (req, res, next) => {
    const numberOfFields = Object.keys(req.body).length;
    if (numberOfFields == 0) {
      return res.status(400).json({ message: "no feild given" });
    }
    next();
  },
  check("user").exists().isString(),
  check("password").exists().isString(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "not in proper format" });
    }
    next();
  },
];
const login_middleware = [validateRequestBody_login, verifyTokenuser];
router.post("/login", login_middleware, user_login);

const validateRequestBody_login_session = [
  (req, res, next) => {
    const numberOfFields = Object.keys(req.body).length;
    if (numberOfFields == 0) {
      return res.status(400).json({ message: "no feild given" });
    }
    next();
  },
  check("session_id").exists().isString(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "not in proper format" });
    }
    next();
  },
];
const login_session_middleware = [
  validateRequestBody_login_session,
  verifyTokenuser,
];
router.post("/login-session", login_session_middleware, user_login_session);

const validateRequestBody_update = [
  (req, res, next) => {
    const numberOfFields = Object.keys(req.body).length;
    const putallowedFields = ["name", "user", "key", "phone"];
    if (numberOfFields == 0) {
      return res.status(400).json({ message: "no feild given" });
    }
    for (const key in req.body) {
      if (!putallowedFields.includes(key)) {
        return res
          .status(400)
          .json({ error: `Field '${key}' is not allowed.` });
      }
    }
    next();
  },
  check("key").exists().isString(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "not in proper format" });
    }
    next();
  },
];
const update_middleware = [validateRequestBody_update, verifyTokenuser];
router.put("/update", update_middleware, user_update);

const validateRequestBody_default = [
  (req, res, next) => {
    const numberOfFields = Object.keys(req.body).length;
    if (numberOfFields == 0) {
      return res.status(400).json({ message: "no feild given" });
    }
    next();
  },
  check("key").exists().isString(),
  check("user").exists().isString(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "not in proper format" });
    }
    next();
  },
];
const default_middleware = [validateRequestBody_default, verifyTokenuser];
router.post("/default", default_middleware, user_default);

const validateRequestBody_delete = [
  (req, res, next) => {
    const numberOfFields = Object.keys(req.body).length;
    if (numberOfFields == 0) {
      return res.status(400).json({ message: "no feild given" });
    }
    next();
  },
  check("key").exists().isString(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "not in proper format" });
    }
    next();
  },
];
const delete_middleware = [validateRequestBody_delete, verifyTokenuser];
router.delete("/delete", delete_middleware, user_delete);

const validateRequestBody_sendverify_mail_user = [
  (req, res, next) => {
    const numberOfFields = Object.keys(req.body).length;
    if (numberOfFields == 0) {
      return res.status(400).json({ message: "no feild given" });
    }
    next();
  },
  check("user").exists().isString(),
  check("key").exists().isString(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "not in proper format" });
    }
    next();
  },
];
const sendverify_mail_middleware = [
  validateRequestBody_sendverify_mail_user,
  verifyTokenuser,
];
router.post(
  "/sendverification_mail",
  sendverify_mail_middleware,
  user_sendverification_email
);

const validateRequestBody_getverify_mail_user = [
  (req, res, next) => {
    const numberOfFields = Object.keys(req.body).length;
    if (numberOfFields == 0) {
      return res.status(400).json({ message: "no feild given" });
    }
    next();
  },
  check("mail_verification_key").exists().isString(),
  check("key").exists().isString(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "not in proper format" });
    }
    next();
  },
];
const getverify_mail_middleware = [validateRequestBody_getverify_mail_user];
router.post(
  "/getverification_mail",
  getverify_mail_middleware,
  user_getverification_email
);

const validateRequestBody_sendotp_mail_user = [
  (req, res, next) => {
    const numberOfFields = Object.keys(req.body).length;
    if (numberOfFields == 0) {
      return res.status(400).json({ message: "no feild given" });
    }
    next();
  },
  check("user").exists().isString(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "not in proper format" });
    }
    next();
  },
];
const sendotp_mail_middleware = [
  validateRequestBody_sendotp_mail_user,
  verifyTokenuser,
];
router.post("/sendotp_mail", sendotp_mail_middleware, user_sendotp_email);

const validateRequestBody_verifyotp_mail_user = [
  (req, res, next) => {
    const numberOfFields = Object.keys(req.body).length;
    if (numberOfFields == 0) {
      return res.status(400).json({ message: "no feild given" });
    }
    next();
  },
  check("otp").exists().isString(),
  check("user").exists().isString(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "not in proper format" });
    }
    next();
  },
];
const verifyotp_mail_middleware = [
  validateRequestBody_verifyotp_mail_user,
  verifyTokenuser,
];
router.post("/verifyotp_mail", verifyotp_mail_middleware, user_verifyotp_email);

const validateRequestBody_forgetpassword = [
  (req, res, next) => {
    const numberOfFields = Object.keys(req.body).length;
    if (numberOfFields == 0) {
      return res.status(400).json({ message: "no feild given" });
    }
    next();
  },
  check("forget_password_key").exists().isString(),
  check("password").exists().isString(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "not in proper format" });
    }
    next();
  },
];
const forgetpassword_middleware = [
  validateRequestBody_forgetpassword,
  verifyTokenuser,
];
router.post("/forgetpassword", forgetpassword_middleware, user_forgetpassword);

const validateRequestBody_changepassword = [
  (req, res, next) => {
    const numberOfFields = Object.keys(req.body).length;
    if (numberOfFields == 0) {
      return res.status(400).json({ message: "no feild given" });
    }
    next();
  },
  check("oldpassword").exists().isString(),
  check("key").exists().isString(),
  check("password").exists().isString(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "not in proper format" });
    }
    next();
  },
];
const changepassword_middleware = [
  validateRequestBody_changepassword,
  verifyTokenuser,
];
router.post("/changepassword", changepassword_middleware, user_changepassword);

const validateRequestBody_sendverify_phone = [
  (req, res, next) => {
    const numberOfFields = Object.keys(req.body).length;
    if (numberOfFields == 0) {
      return res.status(400).json({ message: "no feild given" });
    }
    next();
  },
  check("key").exists().isString(),
  check("phone").exists().isString(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "not in proper format" });
    }
    next();
  },
];
const sendverify_middleware_phone = [
  validateRequestBody_sendverify_phone,
  verifyTokenuser,
];
router.post(
  "/sendverification_phone",
  sendverify_middleware_phone,
  user_sendverification_phone
);

const validateRequestBody_getverify_phone_user = [
  (req, res, next) => {
    const keyParam = req.query.key;

    if (typeof keyParam === "undefined" || keyParam === null) {
      return res
        .status(400)
        .json({ message: "Missing 'key' parameter in the query string" });
    }

    if (typeof keyParam !== "string") {
      return res
        .status(400)
        .json({ message: "The 'key' parameter is not a string" });
    }

    const [apikey, data] = decode_byte64(keyParam);
    if (apikey !== process.env.PHONE_VERIFICATION_APIKEY) {
      return res
        .status(400)
        .json({ message: "invalid Authorization header format." });
    }
    next();
  },
];
const getverify_phone_middleware = [validateRequestBody_getverify_phone_user];
router.get(
  "/getverification_phone",
  getverify_phone_middleware,
  user_getverification_phone
);

const validateRequestBody_sendotp_phone_user = [
  (req, res, next) => {
    const numberOfFields = Object.keys(req.body).length;
    if (numberOfFields == 0) {
      return res.status(400).json({ message: "no feild given" });
    }
    next();
  },
  check("phone").exists().isString(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "not in proper format" });
    }
    next();
  },
];
const sendotp_phone_middleware = [
  validateRequestBody_sendotp_phone_user,
  verifyTokenuser,
];
router.post("/sendotp_phone", sendotp_phone_middleware, user_sendotp_phone);

const validateRequestBody_verifyotp_phone_user = [
  (req, res, next) => {
    const numberOfFields = Object.keys(req.body).length;
    if (numberOfFields == 0) {
      return res.status(400).json({ message: "no feild given" });
    }
    next();
  },
  check("otp").exists().isString(),
  check("phone").exists().isString(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "not in proper format" });
    }
    next();
  },
];
const verifyotp_phone_middleware = [
  validateRequestBody_verifyotp_phone_user,
  verifyTokenuser,
];
router.post(
  "/verifyotp_phone",
  verifyotp_phone_middleware,
  user_verifyotp_phone
);

module.exports = router;
