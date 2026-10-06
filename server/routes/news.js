import express from 'express';
import { getWildlifeNews } from '../controllers/newsController.js';

const router = express.Router();

router.get('/', getWildlifeNews);

export default router;
