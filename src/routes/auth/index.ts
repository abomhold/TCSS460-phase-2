import express, { Router } from 'express';
import { checkToken } from '../../core/middleware';

import { signinRouter } from './login';
import { registerRouter } from './register';
import { changePasswordRouter } from './changePassword';

const authRoutes: Router = express.Router();

authRoutes.use(signinRouter, registerRouter);

authRoutes.use('/password', checkToken, changePasswordRouter);

export { authRoutes };
