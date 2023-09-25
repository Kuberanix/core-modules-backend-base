import express from 'express';
import { GETUSERS } from '#controllers/user/route.js';
const router = express.Router();
router.get('/', GETUSERS);
export default router;
