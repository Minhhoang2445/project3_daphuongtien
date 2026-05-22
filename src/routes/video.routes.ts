import { Router } from 'express';
import {
  createVideoController,
  listVideos,
  videoDetail
} from '../controllers/video.controller';

const router = Router();

router.get('/', listVideos);
router.get('/:id', videoDetail);
router.post('/', createVideoController);

export default router;