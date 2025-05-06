import User from '../models/User.js';
import axios from 'axios';

export const createUser = async (req, res) => {
    try {
        const { name, email, role } = req.body;
        const user = new User({ name, email, role });
        await user.save();
        res.status(201).json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            created_at: user.createdAt
        });
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
        res.status(200).json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            created_at: user.createdAt,
            updated_at: user.updatedAt
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching user", error: error.message });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { name, email } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { name, email },
            { new: true }
        );
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            created_at: user.createdAt,
            updated_at: user.updatedAt
        });
    } catch (error) {
        res.status(500).json({ message: "Error updating user", error: error.message });
    }
};

export const getActiveUsers = async (req, res) => {
    try {
        const response = await axios.get('http://localhost:8083/api/loans/active-users').catch(() => {
            throw new Error("Loan Service unavailable");
        });
        const activeLoans = response.data;

        const activeUsers = [];
        for (const loan of activeLoans.slice(0, 5)) {
            const user = await User.findById(loan._id);
            if (user) {
                activeUsers.push({
                    user_id: loan._id,
                    name: user.name,
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

export const countUsers = async (req, res) => {
    try {
        const count = await User.countDocuments();
        res.status(200).json({ count });
    } catch (error) {
        res.status(500).json({ message: "Error counting users", error: error.message });
    }
};