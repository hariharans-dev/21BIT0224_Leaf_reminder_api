const router = require("express").Router();
const { check, validationResult } = require("express-validator");

const {
  inventory_post,
  inventory_delete,
  inventory_list,
  inventory_update,
  inventory_find,
} = require("../controller/inventory/api_inventory_controller.js");

const verifyTokeninventory = (req, res, next) => {
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
    apiKey !== process.env.INVENTORY_APIKEY &&
    apiKey !== process.env.ADMIN_APIKEY
  ) {
    return res.status(401).json({ message: "invalid Authorization" });
  }
  next();
};

const validateRequestBody_inventory_post = [
  (req, res, next) => {
    const numberOfFields = Object.keys(req.body).length;
    if (numberOfFields == 0) {
      return res.status(400).json({ message: "no feild given" });
    }
    next();
  },
  check("device").exists().isString(),
  check("deviceid").exists().isString(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "not in proper format" });
    }
    next();
  },
];
const inventorypost_middleware = [
  validateRequestBody_inventory_post,
  verifyTokeninventory,
];
router.post("/inventory", inventorypost_middleware, inventory_post);

const validateRequestBody_inventory_delete = [
  (req, res, next) => {
    const numberOfFields = Object.keys(req.body).length;
    if (numberOfFields == 0) {
      return res.status(400).json({ message: "no feild given" });
    }
    next();
  },
  check("deviceid").exists().isNumeric(),
];

router.delete(
  "/inventory",
  validateRequestBody_inventory_delete,
  inventory_delete
);

const validateRequestBody_inventory_find = [
  (req, res, next) => {
    const numberOfFields = Object.keys(req.body).length;
    if (numberOfFields == 0) {
      return res.status(400).json({ message: "no feild given" });
    }
    next();
  },
  check("device").exists().isString(),
];

router.get("/inventory", validateRequestBody_inventory_find, inventory_find);

const validateRequestBody_inventory_list = [
  (req, res, next) => {
    const numberOfFields = Object.keys(req.body).length;
    if (numberOfFields == 0) {
      return res.status(400).json({ message: "no feild given" });
    }
    next();
  },
  check("device").exists().isString(),
];

router.get(
  "/inventory/all",
  validateRequestBody_inventory_list,
  inventory_list
);

const validateRequestBody_inventory_update = [
  (req, res, next) => {
    const numberOfFields = Object.keys(req.body).length;
    if (numberOfFields == 0) {
      return res.status(400).json({ message: "no feild given" });
    }
    next();
  },
  check("device").exists().isString(),
  check("olddeviceid").exists().isNumeric(),
  check("newdeviceid").exists().isNumeric(),
];

router.put(
  "/inventory",
  validateRequestBody_inventory_update,
  inventory_update
);

module.exports = router;
