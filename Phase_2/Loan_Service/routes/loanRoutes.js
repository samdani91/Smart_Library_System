import express from "express";
import {
    issueBook,
    returnBook,
    getLoansByUser,
    getLoanById,
    getOverdueLoans,
    extendLoan,
    getStatsOverview,
    getLoanCountsByBook,
    getActiveLoansByUser
} from '../controllers/loan.controller.js';

const router = express.Router();

router.post('/', issueBook);
router.post('/returns', returnBook);
router.get('/stats/overview', getStatsOverview);
router.get('/book-stats', getLoanCountsByBook);
router.get('/active-users', getActiveLoansByUser);
router.get('/user/:user_id', getLoansByUser);
router.get('/overdue', getOverdueLoans);
router.get('/:id', getLoanById);
router.put('/:id/extend', extendLoan);


export default router;