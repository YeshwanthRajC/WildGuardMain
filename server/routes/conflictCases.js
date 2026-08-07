import express from 'express';
import {
  getAllConflictCases,
  createConflictCase,
  updateConflictCase,
  deleteConflictCase
} from '../controllers/conflictCaseController.js';

const router = express.Router();

router.get('/', getAllConflictCases);
router.post('/', createConflictCase);
router.put('/:id', updateConflictCase);
router.delete('/:id', deleteConflictCase);

export default router;
