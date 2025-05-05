import express from "express";
import {
    issueBook,
    returnBook,
    getLoansByUser,
    getOverdueLoans,
    extendLoan,
    getStatsOverview
} from '../controllers/loan.controller.js';

const router = express.Router();

router.post('/', issueBook);
router.post('/returns', returnBook);
router.get('/overdue', getOverdueLoans);
router.get('/:user_id', getLoansByUser);
router.put('/:id/extend', extendLoan);
router.get('/stats/overview', getStatsOverview);


export default router;