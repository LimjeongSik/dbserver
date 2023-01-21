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
const bcrypt_1 = __importDefault(require("bcrypt"));
const dotenv_1 = __importDefault(require("dotenv"));
const mysql2_1 = __importDefault(require("mysql2"));
dotenv_1.default.config();
const connection = mysql2_1.default.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
});
connection.connect();
const users = {
    lookup: (req, res) => {
        connection.query("select * from jabble.users", (err, rows) => {
            res.send(rows);
        });
    },
    register: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { name, phone, userId, userPw } = req.body;
        try {
            const hash = yield bcrypt_1.default.hash(userPw, 12);
            connection.query("insert into jabble.users (name, phone, userId, userPw) values(?,?,?,?)", [name, phone, userId, hash], (err) => {
                if (err) {
                    res.status(409).send({
                        msg: "중복된 아이디 입니다.",
                        content: {
                            errcode: err.code,
                            errstate: err.sqlState,
                            errnum: err.errno,
                        },
                    });
                }
                else {
                    res.status(200).send({ msg: "success" });
                }
            });
        }
        catch (error) {
            console.error(error);
            return next(error);
        }
    }),
    login: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { userId, userPw } = req.body;
        try {
            connection.query("select * from jabble.users where userId=?", [userId], (err, rows) => {
                if (err)
                    throw Error;
                if (!rows[0]) {
                    res.status(400).send({
                        msg: "아이디가 존재하지 않습니다",
                    });
                }
                else {
                    const pw = rows[0].userPw;
                    bcrypt_1.default.compare(userPw, pw, (err, result) => {
                        if (result) {
                            res.cookie("user", userId, {
                                expires: new Date(Date.now() + 900000),
                                httpOnly: true,
                                secure: false,
                                signed: true,
                            });
                            return res.send(req.signedCookies);
                        }
                        else {
                            return res.status(400).send({
                                msg: "비밀번호가 일치하지않습니다.",
                            });
                        }
                    });
                }
            });
        }
        catch (error) {
            console.error(error);
            next(error);
        }
    }),
    logout: (req, res, next) => {
        res.clearCookie("user", {
            httpOnly: true,
            secure: false,
            signed: true,
        });
        req.session.destroy((err) => {
            if (err)
                throw err;
        });
        console.log("쿠키 삭제");
        console.log(req.signedCookies);
        next();
    },
};
exports.default = users;
