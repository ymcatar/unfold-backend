/**
 * REST API app.
 */
import express from 'express';
import morgan from 'morgan';
import { Config } from '../config';
import { logger } from '../utils';

import { authMiddleware } from '../auth';
import { errorHandler } from '../errors';

import { router as authRouter } from './auth';
import { router as eventRouter } from './event';
import { router as userRouter } from './user';
import { router as translateRouter } from './translate';


// /api router
const router = express.Router();

router.use('/', function accessControl(req, res, next) {
    res.set('Access-Control-Allow-Origin', Config.accessControl.allowOrigin);
    res.set('Access-Control-Max-Age', Config.accessControl.maxAge);
    res.set('Access-Control-Allow-Headers', 'Authorization, Accept, Content-Type');
    res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    next();
});

/**
 * Default cache control policy. Private and always revalidate.
 */
router.use('/', function cacheControl(req, res, next) {
    res.set('Cache-Control', 'private, max-age=0');
    next();
});

router.use('/', authMiddleware);

router.use('/auth', authRouter);
router.use('/event', eventRouter);
router.use('/user', userRouter);
router.use('/translate', translateRouter);

router.get('/', function(req, res) {
    res.json({ message: 'It works!' });
});

// Catch-all error handler
router.use(errorHandler);


// The actual app
export const app = express();

app.set('x-powered-by', false);
app.set('trust proxy', true);

app.use(morgan('short', {
    stream: {
        write(contents) {
            contents = contents.toString();
            if (contents[contents.length - 1] === '\n')
                contents = contents.substr(0, contents.length - 1);
            logger.info('rest', contents);
        },
    },
}));

app.use('/api', router);
