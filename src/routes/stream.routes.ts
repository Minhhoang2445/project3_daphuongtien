import { Router } from 'express';
import { liveStreams } from '../controllers/stream.controller';

const router = Router();

router.get('/live', liveStreams);

export default router;
