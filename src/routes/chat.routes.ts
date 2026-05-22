import { Router } from 'express';
import { listChatMessages, sendChatMessage } from '../controllers/chat.controller';

const router = Router();

router.get('/:username/chat', listChatMessages);
router.post('/:username/chat', sendChatMessage);

export default router;
