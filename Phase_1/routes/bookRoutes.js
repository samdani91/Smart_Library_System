import express from "express";
import {
    addBook,
    searchBooks,
    getBookById,
    updateBook,
    deleteBook,
    getPopularBooks
} from '../controllers/book.controller.js';

const router = express.Router();

router.post('/', addBook);
router.get('/', searchBooks);
router.get('/:id', getBookById);
router.put('/:id', updateBook);
router.delete('/:id', deleteBook);
router.get('/stats/popular', getPopularBooks);

export default router;