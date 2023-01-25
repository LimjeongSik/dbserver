import express from "express";
import dotenv from "dotenv";
import users from "../controllers/users";

dotenv.config();

const router = express.Router();

router.post("/", users.register);
router.post("/login", users.login);
router.get("/logout", users.logout);
router.post("/auth", users.auth);

export default router;
