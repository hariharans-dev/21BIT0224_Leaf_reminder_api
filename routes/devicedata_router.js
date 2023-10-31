const router = require("express").Router();
const { check, validationResult } = require("express-validator");

const {
  devicedata_post,
  control_timeinterval,
  control_manual,
  control_automatic,
  control_create,
} = require("../controller/devicedata/api_devicedata_controller.js");

function decode_byte64(base64Credentials) {
  const decodedCredentials = Buffer.from(base64Credentials, "base64").toString(
    "utf-8"
  );
  const [user, password] = decodedCredentials.split(":");
  return [user, password];
}

const verifyTokendevice = (req, res, next) => {
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
  const [key, data] = decode_byte64(apiKey);
  if (
    key !== process.env.DEVICE_DATA_APIKEY &&
    key !== process.env.ADMIN_APIKEY
  ) {
    return res.status(401).json({ message: "invalid Authorization" });
  }
  next();
};

const validateRequestBody_devicedata_post = [
  (req, res, next) => {
    const numberOfFields = Object.keys(req.body).length;
    if (numberOfFields == 0) {
      return res.status(400).json({ message: "no feild given" });
    }
    next();
  },
  check("soilmoisture").exists().isNumeric(),
  check("temperature").exists().isNumeric(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors);
      return res
        .status(400)
        .json({ message: "not in proper format", error: errors });
    }
    next();
  },
];
const post_middleware = [
  validateRequestBody_devicedata_post,
  verifyTokendevice,
];
router.post("/devicedata", post_middleware, devicedata_post);

const validateRequestBody_control_create = [
  (req, res, next) => {
    const numberOfFields = Object.keys(req.body).length;
    if (numberOfFields == 0) {
      return res.status(400).json({ message: "no feild given" });
    }
    next();
  },
  check("deviceid").exists().isString(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "not in proper format" });
    }
    next();
  },
];
const controls_create_middleware = [
  validateRequestBody_control_create,
  verifyTokendevice,
];
router.post("/control/create", controls_create_middleware, control_create);

const validateRequestBody_control_automatic = [
  (req, res, next) => {
    const numberOfFields = Object.keys(req.body).length;
    if (numberOfFields == 0) {
      return res.status(400).json({ message: "no feild given" });
    }
    next();
  },
  check("water").exists().isString(),
  check("deviceid").exists().isString(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "not in proper format" });
    }
    next();
  },
];
const controls_automatic_middleware = [
  validateRequestBody_control_automatic,
  verifyTokendevice,
];
router.post(
  "/control/automatic",
  controls_automatic_middleware,
  control_automatic
);

const validateRequestBody_control_manual = [
  (req, res, next) => {
    const numberOfFields = Object.keys(req.body).length;
    if (numberOfFields == 0) {
      return res.status(400).json({ message: "no feild given" });
    }
    next();
  },
  check("water").exists().isString(),
  check("deviceid").exists().isString(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "not in proper format" });
    }
    next();
  },
];
const controls_manual_middleware = [
  validateRequestBody_control_manual,
  verifyTokendevice,
];
router.post("/control/manual", controls_manual_middleware, control_manual);

const validateRequestBody_control_timeinterval = [
  (req, res, next) => {
    const numberOfFields = Object.keys(req.body).length;
    if (numberOfFields == 0) {
      return res.status(400).json({ message: "no feild given" });
    }
    next();
  },
  check("water").exists().isString(),
  check("deviceid").exists().isString(),
  check("timeinterval").exists().isString(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "not in proper format" });
    }
    next();
  },
];
const controls_timeinterval_middleware = [
  validateRequestBody_control_timeinterval,
  verifyTokendevice,
];
router.post(
  "/control/timeinterval",
  controls_timeinterval_middleware,
  control_timeinterval
);

module.exports = router;
