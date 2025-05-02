import express, { Router } from 'express';

import { checkToken } from '../../core/middleware';
import { tokenTestRouter } from './tokenTest';
import { messageRouter } from './closed_message';
import { bookRouter } from './book';
import { changePasswordRouter } from '../auth/changePassword';

const closedRoutes: Router = express.Router();

closedRoutes.use('/jwt_test', checkToken, tokenTestRouter);

closedRoutes.use('/c/message', checkToken, messageRouter);

closedRoutes.use('/c/book', checkToken, bookRouter);

closedRoutes.use('/c/password', checkToken, changePasswordRouter);

export { closedRoutes };
