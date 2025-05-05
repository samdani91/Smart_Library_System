import User from '../models/User.js';
import { getActiveLoansByUser } from './loan.controller.js';


export const createUser = async (req, res) => {
    try {
        const { name, email, role } = req.body;
        const user = new User({ name, email, role });
        await user.save();
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ message: "Error creating user", error: error.message });
    }
};


export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Error fetching user", error: error.message });
    }
};

export const getUser = async (id) => {
    try {
        const user = await User.findById(id);
        if (!user) {
            return { status: 404, message: "User not found" };
        }
        return { status: 200, user };
    } catch (error) {
        return { status: 500, message: "Error fetching user", error: error.message };
    }
};

export const countUsers = async () => {
    try {
        return await User.countDocuments();
    } catch (error) {
        throw new Error("Error counting users: " + error.message);
    }
};

export const getActiveUsers = async (req, res) => {
    try {
        const activeLoans = await getActiveLoansByUser();
        const activeUsers = [];

        for (const loan of activeLoans.slice(0, 5)) {
            const userResponse = await getUser(loan._id);
            if (userResponse.user) {
                activeUsers.push({
                    user_id: loan._id,
                    name: userResponse.user.name,
                    books_borrowed: loan.books_borrowed,
                    current_borrows: loan.books_borrowed
                });
            }
        }

        res.status(200).json(activeUsers);
    } catch (error) {
        res.status(500).json({ message: "Error fetching active users", error: error.message });
    }
};