import express from "express";
import {
    createUser,
    getUserById,
    getActiveUsers
} from '../controllers/user.controller.js';

const router = express.Router();

router.post('/', createUser);
router.get('/:id', getUserById);
router.get('/stats/active', getActiveUsers);

export default router;