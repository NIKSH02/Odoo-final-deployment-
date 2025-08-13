import express from 'express';
import { generateStaticMap, getDirections } from '../controllers/mapController.js';

const router = express.Router();

// Generate static map image
router.get('/static-map', generateStaticMap);

// Get directions between two points
router.get('/directions', getDirections);

export default router;
