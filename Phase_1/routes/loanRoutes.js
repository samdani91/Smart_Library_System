import express from "express";
import {
    issueBook,
    returnBook,
    getLoansByUser,
    getOverdueLoans,
    extendLoan
} from '../controllers/loan.controller.js';

const router = express.Router();

router.post('/', issueBook);
router.post('/returns', returnBook);
router.get('/overdue', getOverdueLoans);
router.get('/:user_id', getLoansByUser);
router.put('/:id/extend', extendLoan);

export default router;