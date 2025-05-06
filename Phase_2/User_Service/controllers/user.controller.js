import User from '../models/User.js';
import axios from 'axios';

const CircuitBreakerStates = {
    CLOSED: 'CLOSED',
    OPEN: 'OPEN',
    HALF_OPEN: 'HALF_OPEN'
};

class CircuitBreaker {
    constructor(serviceName, timeout = 5000) {
        this.serviceName = serviceName;
        this.state = CircuitBreakerStates.CLOSED;
        this.failureCount = 0;
        this.failureThreshold = 3;
        this.resetAfter = 30000;
        this.timeout = timeout;
        this.lastFailureTime = null;
    }

    async execute(requestFn) {
        
        if (this.state === CircuitBreakerStates.OPEN) {
            if (Date.now() - this.lastFailureTime > this.resetAfter) {
                this.state = CircuitBreakerStates.HALF_OPEN;
            }
            throw new Error(`${this.serviceName} service circuit breaker is ${this.state}`);
            
        }

        try {
            const response = await requestFn();
            if (this.state === CircuitBreakerStates.HALF_OPEN) {
                this.state = CircuitBreakerStates.CLOSED;
                this.failureCount = 0;
            }
            return response;
        } catch (error) {
            this.failureCount++;
            this.lastFailureTime = Date.now();
            
            if (this.failureCount >= this.failureThreshold) {
                this.state = CircuitBreakerStates.OPEN;
            }
            
            throw error;
        }
    }
}

const loanServiceBreaker = new CircuitBreaker('LoanService');

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
        const response = await loanServiceBreaker.execute(() =>
            axios.get('http://loan-service:8083/api/loans/active-users', { timeout: 5000 })
        );
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
        res.status(error.message.includes('circuit breaker is OPEN') ? 503 : 500).json({
            message: "Error fetching active users",
            error: error.message
        });
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