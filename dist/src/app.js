"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const users_1 = __importDefault(require("./routes/users"));
const app = (0, express_1.default)();
const PORT = process.env.PORT;
dotenv_1.default.config();
app.use(express_1.default.urlencoded({ extended: false }));
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get("/", (req, res, next) => {
    res.send("holla~");
});
app.use("/users", users_1.default);
app.listen(PORT, () => {
    console.log("server start");
});
