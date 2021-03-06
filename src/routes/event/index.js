import express from 'express';

import { router as infoRouter } from './info';
import { router as timelineRouter } from './timeline';
import { router as timegramRouter } from './timegram';
import { router as sourcesRouter } from './sources';


export const router = express.Router();

router.use('/', infoRouter);
router.use('/', timelineRouter);
router.use('/', timegramRouter);
router.use('/', sourcesRouter);
