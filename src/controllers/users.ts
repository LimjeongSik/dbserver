import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import mysql from "mysql2";
import { UserType } from "../types";
dotenv.config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
});
connection.connect();

const users = {
    lookup: (req: Request, res: Response) => {
        connection.query(
            "select * from jabble.users",
            (err: mysql.QueryError | null, rows: any) => {
                res.send(rows);
            }
        );
    },

    register: async (req: Request, res: Response, next: NextFunction) => {
        const { name, phone, userId, userPw }: UserType = req.body;
        try {
            const hash = await bcrypt.hash(userPw, 12);
            connection.query(
                "insert into jabble.users (name, phone, userId, userPw) values(?,?,?,?)",
                [name, phone, userId, hash],
                (err: mysql.QueryError | null) => {
                    if (err) {
                        res.status(409).send({
                            msg: "중복된 아이디 입니다.",
                            content: {
                                errcode: err.code,
                                errstate: err.sqlState,
                                errnum: err.errno,
                            },
                        });
                    } else {
                        res.status(200).send({ msg: "success" });
                    }
                }
            );
        } catch (error) {
            console.error(error);
            return next(error);
        }
    },

    login: async (req: Request, res: Response, next: NextFunction) => {
        const { userId, userPw }: UserType = req.body;
        try {
            connection.query(
                "select * from jabble.users where userId=?",
                [userId],
                (err: mysql.QueryError | null, rows: any) => {
                    if (err) throw Error;
                    if (!rows[0]) {
                        res.status(400).send({
                            msg: "아이디가 존재하지 않습니다",
                        });
                    } else {
                        const pw = rows[0].userPw;
                        bcrypt.compare(userPw, pw, (err, result) => {
                            if (result) {
                                res.cookie("user", userId, {
                                    expires: new Date(Date.now() + 900000),
                                    httpOnly: true,
                                    secure: false,
                                    signed: true,
                                });

                                return res.send(req.signedCookies);
                            } else {
                                return res.status(400).send({
                                    msg: "비밀번호가 일치하지않습니다.",
                                });
                            }
                        });
                    }
                }
            );
        } catch (error) {
            console.error(error);
            next(error);
        }
    },

    logout: (req: Request, res: Response, next: NextFunction) => {
        res.clearCookie("user", {
            httpOnly: true,
            secure: false,
            signed: true,
        });
        req.session.destroy((err) => {
            if (err) throw err;
        });
        console.log("쿠키 삭제");
        console.log(req.signedCookies);
        next();
    },
};

export default users;
