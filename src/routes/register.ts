import express, { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import mysql from "mysql2";
dotenv.config();

const router = express.Router();
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
});
connection.connect();

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
    const { name, phone, userId, userPw } = req.body;
    try {
        const hash = await bcrypt.hash(userPw, 12);
        connection.query(
            "select * from jabble.users where userId=?",
            [userId],
            (err, rows: any, fields) => {
                if (rows[0] === undefined) {
                    connection.query(
                        "insert into jabble.users (name, phone, userId, userPw) values(?,?,?,?)",
                        [name, phone, userId, hash]
                    );
                    res.send("회원가입 성공");
                } else {
                    console.log("회원가입 실패");
                }
            }
        );
        next();
    } catch (error) {
        console.error(error);
        next(error);
    }
});

export default router;
