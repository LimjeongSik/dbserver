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
    auth: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { sessionId } = req.body;
        try {
            if (req.sessionID === sessionId) {
                return res.send({
                    msg: "현재 로그인중입니다.",
                    userId: req.session.userId,
                    isLogged: true,
                });
            }
            else {
                return res.send({
                    msg: "현재 로그인중이 아닙니다",
                    isLogged: false,
                });
            }
        }
        catch (error) {
            next(error);
        }
    }),
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
        const { userId, userPw, sessionId } = req.body;
        if (sessionId === req.sessionID) {
            return res.status(200).send({
                isLogged: true,
                sessionId: req.sessionID,
            });
        }
        try {
            connection.query("select * from jabble.users where userId=?", [userId], (err, rows) => {
                if (err) {
                    return res.status(400).send({ msg: "에러 발생!" });
                }
                if (!rows[0]) {
                    res.status(400).send({
                        msg: "아이디가 존재하지 않습니다",
                    });
                    return;
                }
                else {
                    const pw = rows[0].userPw;
                    bcrypt_1.default.compare(userPw, pw, (err, result) => {
                        if (!result) {
                            res.status(400).send({
                                msg: "비밀번호가 일치하지않습니다.",
                            });
                            return;
                        }
                        else {
                            req.session.userId = userId;
                            req.session.isLogged = true;
                            req.session.save(() => {
                                return res.status(200).send({
                                    isLogged: true,
                                    sessionId: req.sessionID,
                                });
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
    logout: (req, res) => {
        if (req.session.userId) {
            res.clearCookie("sessionId");
            req.session.destroy((err) => {
                if (err)
                    throw err;
                return res
                    .status(200)
                    .send({ msg: "로그아웃 성공", isLogged: false });
            });
        }
        else {
            return res.status(400).send({ msg: "현재 로그인중이 아닙니다." });
        }
    },
};
exports.default = users;
