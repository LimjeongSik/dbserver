import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import users from "./routes/users";
import * as session from "express-session";
import mysqlSession from "express-mysql-session";
import cookieParser from "cookie-parser";

const app = express();
const PORT = process.env.PORT;
dotenv.config();
const MySQLStore = mysqlSession(session);
const options = {
    host: process.env.DB_HOST as string,
    user: process.env.DB_USER as string,
    password: process.env.DB_PASSWORD as string,
    database: process.env.DB_DATABASE as string,
};
const sessionStore = new MySQLStore(options);

app.use(express.urlencoded({ extended: false }));
app.use(
    cors({
        origin: true,
        credentials: true,
    })
);
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(
    session.default({
        secret: process.env.COOKIE_SECRET!,
        resave: false,
        saveUninitialized: false,
        store: sessionStore,
        cookie: {
            httpOnly: true,
            secure: false,
        },
    })
);

app.use("/users", users);

app.listen(PORT, () => {
    console.log("server start");
});
