import { Router } from 'express';
import { onDone, onPublish } from '../controllers/rtmp.controller';

const router = Router();

router.post('/on-publish', onPublish);
router.post('/on-done', onDone);

export default router;
