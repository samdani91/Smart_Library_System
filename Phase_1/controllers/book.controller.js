import Book from '../models/Book.js';
import { getLoanCountsByBook } from './loan.controller.js';

export const addBook = async (req, res) => {
    try {
        const { title, author, isbn, copies } = req.body;
        const book = new Book({ title, author, isbn, copies });
        await book.save();
        res.status(201).json(book);
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
                { author: { $regex: searchQuery, $options: 'i' } },
                { genre: { $regex: searchQuery, $options: 'i' } }
            ]
        });
        res.status(200).json(books);
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
        res.status(200).json(book);
    } catch (error) {
        res.status(500).json({ message: "Error fetching book details", error: error.message });
    }
};


export const updateBook = async (req, res) => {
    try {
        const { copies, available_copies } = req.body;
        const book = await Book.findByIdAndUpdate(req.params.id, { copies, available_copies }, { new: true });
        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }
        res.status(200).json(book);
    } catch (error) {
        res.status(500).json({ message: "Error updating book", error: error.message });
    }
};


export const deleteBook = async (req, res) => {
    try {
        const book = await Book.findByIdAndDelete(req.params.id);
        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }
        res.status(204).json({ message: "Book deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting book", error: error.message });
    }
};

export const getBook = async (id) => {
    try {
        const book = await Book.findById(id);
        if (!book) {
            return { status: 404, message: "Book not found" };
        }
        return { status: 200, book };
    } catch (error) {
        return { status: 500, message: "Error fetching book details", error: error.message };
    }
};

export const countBooks = async () => {
    try {
        return await Book.countDocuments();
    } catch (error) {
        throw new Error("Error counting books: " + error.message);
    }
};

export const countAvailableBooks = async () => {
    try {
        const books = await Book.find({ available_copies: { $gt: 0 } });
        return books.length;
    } catch (error) {
        throw new Error("Error counting available books: " + error.message);
    }
};

export const getPopularBooks = async (req, res) => {
    try {
        const loanCounts = await getLoanCountsByBook();
        const popularBooks = [];

        for (const loan of loanCounts.slice(0, 5)) {
            const bookResponse = await getBook(loan._id);
            if (bookResponse.book) {
                popularBooks.push({
                    book_id: loan._id,
                    title: bookResponse.book.title,
                    author: bookResponse.book.author,
                    borrow_count: loan.borrow_count
                });
            }
        }

        res.status(200).json(popularBooks);
    } catch (error) {
        res.status(500).json({ message: "Error fetching popular books", error: error.message });
    }
};