import { Router } from 'express';
import { getObsConfig, getStreamer } from '../controllers/streamer.controller';

const router = Router();

router.get('/:username/obs-config', getObsConfig);
router.get('/:username', getStreamer);

export default router;
