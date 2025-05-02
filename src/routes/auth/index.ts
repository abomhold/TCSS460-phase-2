import express, { Router } from 'express';

import { signinRouter } from './login';
import { registerRouter } from './register';
import { passwordRouter } from './changePassword'; //changePassword.ts in auth
const authRoutes: Router = express.Router();

authRoutes.use(signinRouter, registerRouter);
authRoutes.use(signinRouter, registerRouter, passwordRouter); //add passwords router

export { authRoutes };
