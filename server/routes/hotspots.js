import express from 'express';
import * as hotspotController from '../controllers/hotspotController.js';

const router = express.Router();

// GET all hotspots with their associated animals
router.get('/', hotspotController.getAllHotspots);

// POST a new hotspot with initial animal
router.post('/', hotspotController.createHotspot);

// PUT to update a hotspot's animals (add/remove)
router.put('/:id', hotspotController.updateHotspotAnimals);

// DELETE a hotspot
router.delete('/:id', hotspotController.deleteHotspot);

export default router;
