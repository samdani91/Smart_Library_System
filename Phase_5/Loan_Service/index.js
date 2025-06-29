import express from "express";
import cors from "cors";
import connectDb from "./mongodb.js";
import loanRoutes from "./routes/loanRoutes.js";
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
    res.send("Loan Service is running!");
});

app.use("/api/loans", loanRoutes);

app.listen(port, () => {
    console.log(`Loan Service is running on port ${port}`);
});

