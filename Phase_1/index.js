import express from "express";
import cors from "cors";
import connectDb from "./mongodb.js";
import userRoutes from "./routes/userRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import loanRoutes from "./routes/loanRoutes.js";

const app = express();
const port = 5000;

connectDb();

app.use(express.json());

const corsOptions = {
	origin: 'http://localhost:3000',
	credentials: true,
};

app.use(cors(corsOptions));

app.get("/", (req, res) => {
	res.send("Backend is working!");
});

app.use("/api/users", userRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/loans", loanRoutes);

app.listen(port, () => {
	console.log(`Backend server is running on port ${port}`);
});