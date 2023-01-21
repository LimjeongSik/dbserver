"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const users_1 = __importDefault(require("../controllers/users"));
dotenv_1.default.config();
const router = express_1.default.Router();
router.post("/", users_1.default.register);
router.post("/login", users_1.default.login);
router.get("/logout", users_1.default.logout);
router.get("/", users_1.default.lookup);
exports.default = router;
