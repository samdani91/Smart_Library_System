import express from "express";
import cors from "cors";
import connectDb from "./mongodb.js";
import userRoutes from "./routes/userRoutes.js"
import dotenv from "dotenv";
dotenv.config();
const app = express();
const port = process.env.PORT;

connectDb();

app.use(express.json());

const corsOptions = {
    origin: '*',
    credentials: true,
};

app.use(cors(corsOptions));

app.get("/", (req, res) => {
    res.send("User Service is running!");
});

app.use("/api/users", userRoutes);

app.listen(port, () => {
    console.log(`User Service is running on port ${port}`);
});