import { Router } from 'express';
import { listVideos, videoDetail } from '../controllers/video.controller';

const router = Router();

router.get('/', listVideos);
router.get('/:id', videoDetail);

export default router;
