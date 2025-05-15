import express from "express";
import cors from "cors";
import connectDb from "./mongodb.js";
import bookRoutes from "./routes/bookRoutes.js";
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
    res.send("Book Service is running!");
});

app.use("/api/books", bookRoutes);

app.listen(port, () => {
    console.log(`Book Service is running on port ${port}`);
});