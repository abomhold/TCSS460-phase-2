import express, { Router } from 'express';
import { createBook } from './createBook';
import { getByQuery } from './getByQuery';
import { getByBookId } from './getByBookId';

const bookRouter: Router = express.Router();

/**
 * Documentation goes here...
 */
bookRouter.post('/', createBook);
/**
 * Documentation goes here...
 */
bookRouter.get('/', getByQuery);
/**
 * Documentation goes here...
 */
bookRouter.get('/:bookId', getByBookId);

export { bookRouter };
