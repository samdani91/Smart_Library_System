import express from "express";
import {
    getPopularBooks,
    getActiveUsers,
    getStatsOverview
} from '../controllers/stats.controller.js';

const router = express.Router();

router.get('/books/popular', getPopularBooks);
router.get('/users/active', getActiveUsers);
router.get('/overview', getStatsOverview);

export default router;