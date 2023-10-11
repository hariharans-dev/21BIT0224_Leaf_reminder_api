const router = require("express").Router();
const { check, validationResult } = require("express-validator");

const {
  user_post,
  user_get,
  user_get_session,
  user_put,
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

const validateRequestBody_post = [
  (req, res, next) => {
    const numberOfFields = Object.keys(req.body).length;
    if (numberOfFields == 0) {
      return res.status(400).json({ message: "no feild given" });
    }
    next();
  },
  check("user").exists().isString(),
  check("password").exists().isString(),
  check("name").exists().isString(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "not in proper format" });
    }
    next();
  },
];
const post_middleware = [validateRequestBody_post, verifyTokenuser];
router.post("/", post_middleware, user_post);

const validateRequestBody_get = [
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
const get_middleware = [validateRequestBody_get, verifyTokenuser];
router.post("/login", get_middleware, user_get);

const validateRequestBody_get_session = [
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
const get_session = [validateRequestBody_get_session, verifyTokenuser];
router.post("/login-session", get_session, user_get_session);

const validateRequestBody_put = [
  (req, res, next) => {
    const numberOfFields = Object.keys(req.body).length;
    const putallowedFields = ["name", "user", "key"];
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
const put_middleware = [validateRequestBody_put, verifyTokenuser];
router.put("/", put_middleware, user_put);

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
router.delete("/", delete_middleware, user_delete);

const validateRequestBody_sendverify_user = [
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
const sendverify_middleware = [
  validateRequestBody_sendverify_user,
  verifyTokenuser,
];
router.post(
  "/sendverification",
  sendverify_middleware,
  user_sendverification_email
);

const validateRequestBody_getverify_user = [
  (req, res, next) => {
    const numberOfFields = Object.keys(req.body).length;
    if (numberOfFields == 0) {
      return res.status(400).json({ message: "no feild given" });
    }
    next();
  },
  check("verification_key").exists().isString(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "not in proper format" });
    }
    next();
  },
];
const getverify_middleware = [
  validateRequestBody_getverify_user,
  verifyTokenuser,
];
router.post(
  "/getverification",
  getverify_middleware,
  user_getverification_email
);

const validateRequestBody_sendotp_user = [
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
const sendotp_middleware = [validateRequestBody_sendotp_user, verifyTokenuser];
router.post("/sendotp", sendotp_middleware, user_sendotp_email);

const validateRequestBody_verifyotp_user = [
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
const verifyotp_middleware = [
  validateRequestBody_verifyotp_user,
  verifyTokenuser,
];
router.post("/verifyotp", verifyotp_middleware, user_verifyotp_email);

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
  "/sendverification",
  sendverify_middleware_phone,
  user_sendverification_phone
);

module.exports = router;
