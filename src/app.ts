import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import cors from "cors";
import users from "./routes/users";

const app = express();
const PORT = process.env.PORT;
dotenv.config();

app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(express.json());

app.get("/", (req: Request, res: Response, next: NextFunction) => {
    res.send("holla~");
});

app.use("/users", users);

app.listen(PORT, () => {
    console.log("server start");
});
