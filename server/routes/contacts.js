import express from 'express';
import { getGroups, createGroup, deleteGroup, addMember, updateMember, deleteMember } from '../controllers/contactController.js';

const router = express.Router();

router.get('/groups', getGroups);
router.post('/groups', createGroup);
router.delete('/groups/:id', deleteGroup);
router.post('/groups/:group_id/members', addMember);
router.put('/members/:id', updateMember);
router.delete('/members/:id', deleteMember);

export default router;
