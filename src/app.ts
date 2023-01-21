import express, { Request, Response, NextFunction } from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";
import users from "./routes/users";

const app = express();
const PORT = process.env.PORT;
dotenv.config();

app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(express.json());

app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(
    session({
        secret: process.env.COOKIE_SECRET!,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: false,
        },
        name: "session-cookie",
    })
);

app.get("/", (req: Request, res: Response, next: NextFunction) => {
    res.send("holla~");
});

app.use("/users", users);

app.listen(PORT, () => {
    console.log("server start");
});
