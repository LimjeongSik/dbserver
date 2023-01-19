import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import mysql from "mysql2";
dotenv.config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
});
connection.connect();

export interface UserType {
    name: string;
    phone: string;
    userId: string;
    userPw: string;
}

const users = {
    lookup: (req: Request, res: Response) => {
        connection.query(
            "select * from jabble.users",
            (err: mysql.QueryError | null, rows: []) => {
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
                            msg: "error",
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
};

export default users;
