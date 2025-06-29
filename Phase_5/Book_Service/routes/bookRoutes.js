import express from "express";
import {
    addBook,
    searchBooks,
    getBookById,
    updateBook,
    updateBookAvailability,
    deleteBook,
    getPopularBooks,
    countBooks,
    countAvailableBooks
} from '../controllers/book.controller.js';

const router = express.Router();

router.post('/create', addBook);
router.get('/', searchBooks);
router.get('/stats/popular', getPopularBooks);
router.get('/count',countBooks);
router.get('/available-count',countAvailableBooks);
router.get('/:id', getBookById);
router.put('/:id', updateBook);
router.patch('/:id/availability', updateBookAvailability);
router.delete('/:id', deleteBook);


export default router;