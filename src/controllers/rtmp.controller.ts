import { Request, Response } from 'express';
import { doneStream, publishStream } from '../services/rtmp.service';

export async function onPublish(req: Request, res: Response) {
  try {
    const streamKey = typeof req.body.name === 'string' ? req.body.name.trim() : '';

    if (!streamKey) {
      return res.status(403).send('Invalid stream key');
    }

    const streamer = await publishStream(streamKey);

    if (!streamer) {
      return res.status(403).send('Invalid stream key');
    }

    return res.status(200).send('OK');
  } catch (error) {
    console.error(error);
    return res.status(500).send('Internal server error');
  }
}

export async function onDone(req: Request, res: Response) {
  try {
    const streamKey = typeof req.body.name === 'string' ? req.body.name.trim() : '';

    if (streamKey) {
      await doneStream(streamKey);
    }

    return res.status(200).send('OK');
  } catch (error) {
    console.error(error);
    return res.status(500).send('Internal server error');
  }
}
