import Book from '../models/Book.js';
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
        this.resetAfter = 30000; // 30 seconds
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

export const addBook = async (req, res) => {
    try {
        const { title, author, isbn, copies } = req.body;
        const book = new Book({ title, author, isbn, copies });
        await book.save();
        res.status(201).json({
            id: book._id,
            title: book.title,
            author: book.author,
            isbn: book.isbn,
            copies: book.copies,
            available_copies: book.available_copies,
            createdAt: book.createdAt
        });
    } catch (error) {
        res.status(500).json({ message: "Error adding book", error: error.message });
    }
};

export const searchBooks = async (req, res) => {
    try {
        const searchQuery = req.query.search || '';
        const books = await Book.find({
            $or: [
                { title: { $regex: searchQuery, $options: 'i' } },
                { author: { $regex: searchQuery, $options: 'i' } }
            ]
        });
        res.status(200).json({
            books: books.map(book => ({
                id: book._id,
                title: book.title,
                author: book.author,
                isbn: book.isbn,
                copies: book.copies,
                available_copies: book.available_copies
            })),
            total: books.length,
            page: 1,
            per_page: 10
        });
    } catch (error) {
        res.status(500).json({ message: "Error searching books", error: error.message });
    }
};

export const getBookById = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }
        res.status(200).json({
            id: book._id,
            title: book.title,
            author: book.author,
            isbn: book.isbn,
            copies: book.copies,
            available_copies: book.available_copies,
            createdAt: book.createdAt,
            updatedAt: book.updatedAt
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching book details", error: error.message });
    }
};

export const updateBook = async (req, res) => {
    try {
        const { title, author, isbn, copies } = req.body;
        const book = await Book.findByIdAndUpdate(
            req.params.id,
            { title, author, isbn, copies, available_copies: copies },
            { new: true }
        );
        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }
        res.status(200).json({
            id: book._id,
            title: book.title,
            author: book.author,
            isbn: book.isbn,
            copies: book.copies,
            available_copies: book.available_copies,
            createdAt: book.createdAt,
            updatedAt: book.updatedAt
        });
    } catch (error) {
        res.status(500).json({ message: "Error updating book", error: error.message });
    }
};

export const updateBookAvailability = async (req, res) => {
    try {
        const { operation } = req.body;
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }
        if (operation === "increment") {
            book.available_copies += 1;
        } else if (operation === "decrement") {
            if (book.available_copies <= 0) {
                return res.status(400).json({ message: "No available copies" });
            }
            book.available_copies -= 1;
        }
        await book.save();
        res.status(200).json({
            id: book._id,
            available_copies: book.available_copies,
            updatedAt: book.updatedAt
        });
    } catch (error) {
        res.status(500).json({ message: "Error updating book availability", error: error.message });
    }
};

export const deleteBook = async (req, res) => {
    try {
        const book = await Book.findByIdAndDelete(req.params.id);
        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }
        res.status(204).json();
    } catch (error) {
        res.status(500).json({ message: "Error deleting book", error: error.message });
    }
};

export const getPopularBooks = async (req, res) => {
    try {
        const response = await loanServiceBreaker.execute(() =>
            axios.get('http://loan-service:8083/api/loans/book-stats', { timeout: 5000 })
        );
        const loanCounts = response.data;

        const popularBooks = [];
        for (const loan of loanCounts.slice(0, 5)) {
            const book = await Book.findById(loan._id);
            if (book) {
                popularBooks.push({
                    book_id: loan._id,
                    title: book.title,
                    author: book.author,
                    borrow_count: loan.borrow_count
                });
            }
        }

        res.status(200).json(popularBooks);
    } catch (error) {
        res.status(error.message.includes('circuit breaker is OPEN') ? 503 : 500).json({
            message: "Error fetching popular books",
            error: error.message
        });
    }
};

export const countBooks = async (req, res) => {
    try {
        const booksCount = await Book.countDocuments();
        res.status(200).json({ count: booksCount });
    } catch (error) {
        console.error("Error counting books:", error);
        res.status(500).json({ message: "Error counting books", error: error.message });
    }
};

export const countAvailableBooks = async (req, res) => {
    try {
        const availableBooksCount = await Book.find({ available_copies: { $gt: 0 } });
        res.status(200).json({ count: availableBooksCount.length });
    } catch (error) {
        res.status(500).json({ message: "Error counting available books", error: error.message });
    }
};