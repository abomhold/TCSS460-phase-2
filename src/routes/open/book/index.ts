import express, { Router } from 'express';
import { createBook } from './createBook';
import { getByAuthor } from './getByAuthor';
import { getByIsbn } from './getByIsbn';

const bookRouter: Router = express.Router();

/**
 * Documentation goes here...
 */
bookRouter.post('/', createBook);
/**
 * Documentation goes here...
 */
bookRouter.get('/', getByAuthor);
/**
 * Documentation goes here...
 */
bookRouter.get('/:isbn', getByIsbn);

export { bookRouter };
