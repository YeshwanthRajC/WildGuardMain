import express from 'express';
import {
  getAllEdgeDevices,
  createEdgeDevice,
  updateEdgeDevice,
  deleteEdgeDevice
} from '../controllers/edgeDeviceController.js';

const router = express.Router();

router.get('/', getAllEdgeDevices);
router.post('/', createEdgeDevice);
router.put('/:id', updateEdgeDevice);
router.delete('/:id', deleteEdgeDevice);

export default router;
