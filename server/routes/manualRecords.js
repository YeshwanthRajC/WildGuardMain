import express from 'express';
import {
  getAllManualRecords,
  createManualRecord,
  updateManualRecord,
  deleteManualRecord
} from '../controllers/manualRecordController.js';

const router = express.Router();

router.get('/', getAllManualRecords);
router.post('/', createManualRecord);
router.put('/:id', updateManualRecord);
router.delete('/:id', deleteManualRecord);

export default router;
