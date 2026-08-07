import express from 'express';
import {
  getNotifications,
  markNotificationRead,
  deleteNotification,
  triggerMaintenanceCheck
} from '../controllers/notificationController.js';

const router = express.Router();

router.get('/', getNotifications);
router.put('/:id/read', markNotificationRead);
router.delete('/:id', deleteNotification);
router.post('/check-maintenance', triggerMaintenanceCheck);

export default router;
