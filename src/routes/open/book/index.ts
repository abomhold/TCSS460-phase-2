import express, { Router } from 'express';
import { createBook } from './createBook';
import { getByAuthor } from './getByAuthor';
import { getByIsbn } from './getByIsbn';

const bookRouter: Router = express.Router();

bookRouter.post('/', createBook);
bookRouter.get('/', getByAuthor);
bookRouter.get('/:isbn', getByIsbn);

export { bookRouter };
