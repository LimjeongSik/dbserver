"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const dotenv_1 = __importDefault(require("dotenv"));
const mysql2_1 = __importDefault(require("mysql2"));
dotenv_1.default.config();
const router = express_1.default.Router();
const connection = mysql2_1.default.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
});
connection.connect();
router.post("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, phone, userId, userPw } = req.body;
    try {
        const hash = yield bcrypt_1.default.hash(userPw, 12);
        connection.query("select * from jabble.users where userId=?", [userId], (err, rows, fields) => {
            if (rows[0] === undefined) {
                connection.query("insert into jabble.users (name, phone, userId, userPw) values(?,?,?,?)", [name, phone, userId, hash]);
                res.send("회원가입 성공");
            }
            else {
                console.log("회원가입 실패");
            }
        });
        next();
    }
    catch (error) {
        console.error(error);
        next(error);
    }
}));
exports.default = router;
