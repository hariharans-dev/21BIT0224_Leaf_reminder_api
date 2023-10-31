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
router.post("/create", inventorypost_middleware, inventory_post);

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
const inventorydelete_middleware = [
  validateRequestBody_inventory_delete,
  verifyTokeninventory,
];
router.delete("/delete", inventorydelete_middleware, inventory_delete);

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
const inventoryfind_middleware = [
  validateRequestBody_inventory_find,
  verifyTokeninventory,
];
router.post("/find", inventoryfind_middleware, inventory_find);

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
const inventorylist_middleware = [
  validateRequestBody_inventory_list,
  verifyTokeninventory,
];
router.post("/findall", inventorylist_middleware, inventory_list);

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
const inventoryupdate_middleware = [
  validateRequestBody_inventory_update,
  verifyTokeninventory,
];
router.put("/update", inventoryupdate_middleware, inventory_update);

module.exports = router;
