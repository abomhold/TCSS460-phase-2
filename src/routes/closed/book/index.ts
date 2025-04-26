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
 * @api {get} /book Request to retrieve book(s) by ISBN13 or Author
 *
 * @apiDescription Retrieves one or more book entries by searching with an ISBN13 or author name. 
 * Query parameters are optional but at least one must be provided. If multiple parameters are passed, they are combined with logical AND.
 * ISBN13 is validated to ensure it is a proper 13-digit number.
 *
 * @apiName GetBookByQuery
 * @apiGroup Book
 *
 * @apiQuery {String} [isbn13] ISBN-13 of the book to search for.
 * @apiQuery {String} [authors] Author name to search for (partial match allowed).
 *
 * @apiSuccess {String} message Description of how many books were found.
 * @apiSuccess {Object[]} data Array of matching book objects.
 * @apiSuccess {Number} data.id Unique ID for the book.
 * @apiSuccess {String} data.isbn13 ISBN-13 identifier of the book.
 * @apiSuccess {String} data.authors Author(s) of the book.
 * @apiSuccess {Number} data.publication_year Year of publication.
 * @apiSuccess {String} data.original_title Original title of the book.
 * @apiSuccess {String} data.title Full title of the book.
 * @apiSuccess {Number} data.rating_avg Average user rating.
 * @apiSuccess {Number} data.rating_count Total number of ratings.
 * @apiSuccess {Number} data.rating_1_star 1-star rating count.
 * @apiSuccess {Number} data.rating_2_star 2-star rating count.
 * @apiSuccess {Number} data.rating_3_star 3-star rating count.
 * @apiSuccess {Number} data.rating_4_star 4-star rating count.
 * @apiSuccess {Number} data.rating_5_star 5-star rating count.
 * @apiSuccess {String} data.image_url URL to the book's image.
 * @apiSuccess {String} data.image_small_url URL to the book's small image.
 *
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "(2) Book(s) found.",
 *       "data": [
 *         { ...book data... },
 *         { ...book data... }
 *       ]
 *     }
 *
 * @apiError (Error 400) {String} message Invalid ISBN format.
 * @apiErrorExample {json} Error Response (Invalid ISBN):
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "message": "Invalid ISBN format. Please provide a valid 13-digit ISBN.",
 *       "data": []
 *     }
 *
 * @apiError (Error 404) {String} message No books found.
 * @apiErrorExample {json} Error Response (Not Found):
 *     HTTP/1.1 404 Not Found
 *     {
 *       "message": "Book not found.",
 *       "data": []
 *     }
 *
 * @apiError (Error 500) {String} message Internal server error.
 * @apiErrorExample {json} Error Response (Internal Error):
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "message": "Internal Server Error",
 *       "data": []
 *     }
 */
bookRouter.get('/', getByQuery);
/**
 * Documentation goes here...
 */
bookRouter.get('/:bookId', getByBookId);

export { bookRouter };
