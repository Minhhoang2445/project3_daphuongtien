import { Router } from 'express';
import { onDone, onPublish,onRecordDone } from '../controllers/rtmp.controller';

const router = Router();

router.post('/on-publish', onPublish);
router.post('/on-done', onDone);
router.post('/on-record-done', onRecordDone);
export default router;
