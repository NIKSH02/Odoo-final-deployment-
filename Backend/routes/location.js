import express from 'express';
import { searchLocations, reverseGeocode } from '../controllers/locationController.js';

const router = express.Router();

// GET /api/location/search?query=mumbai
router.get('/search', searchLocations);

// GET /api/location/reverse?longitude=72.8777&latitude=19.0760
router.get('/reverse', reverseGeocode);

export default router;
