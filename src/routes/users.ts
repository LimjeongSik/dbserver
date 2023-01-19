import express from "express";
import dotenv from "dotenv";
import users from "../controllers/users";

dotenv.config();

interface UserType {
    name: string;
    phone: string;
    userId: string;
    userPw: string;
}

const router = express.Router();

router.route("/").post(users.register);
router.route("/").get(users.lookup);

export default router;
