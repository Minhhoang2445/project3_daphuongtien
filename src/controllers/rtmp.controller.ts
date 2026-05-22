import { Request, Response } from 'express';
import { doneStream, publishStream, recordDoneStream } from '../services/rtmp.service';

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
export async function onRecordDone(req: Request, res: Response) {
  const streamKey = req.body.name;
  const recordPath = req.body.path;

  console.log('on_record_done body:', req.body);

  if (!streamKey) {
    return res.status(400).json({
      success: false,
      message: 'Missing stream key'
    });
  }

  if (!recordPath) {
    return res.status(400).json({
      success: false,
      message: 'Missing record path'
    });
  }

  // Trả về cho Nginx ngay, không chờ FFmpeg chạy xong
  res.status(200).json({
    success: true,
    message: 'Record done received'
  });

  recordDoneStream({
    streamKey,
    recordPath
  })
    .then((video) => {
      console.log('Convert record to VOD success:', video);
    })
    .catch((error) => {
      console.error('Convert record to VOD failed:', error);
    });
}
