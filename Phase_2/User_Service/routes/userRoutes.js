import express from "express";
import {
    createUser,
    getUserById,
    updateUser,
    getActiveUsers,
    countUsers
} from '../controllers/user.controller.js';

const router = express.Router();

router.post('/', createUser);
router.get('/count',countUsers);
router.get('/stats/active', getActiveUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);

export default router;