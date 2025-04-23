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
 * @api {get} /book/:isbn Get Book by ISBN13
 *
 * @apiDescription Retrieves book information by ISBN13. Returns a message and an array of matching book entries (even if only one result).
 * If the ISBN is not found or is improperly formatted, an appropriate message will be returned.
 *
 * @apiName GetBookByIsbn
 * @apiGroup Book
 *
 * @apiParam {String} isbn The 13-digit ISBN to look up.
 *
 * @apiSuccess {String} message Descriptive message about the result.
 * @apiSuccess {Object[]} data List of books that match the ISBN.
 * @apiSuccess {Number} data.id Unique ID for the book.
 * @apiSuccess {String} data.isbn13 ISBN-13 identifier of the book.
 * @apiSuccess {String} data.authors Author(s) of the book.
 * @apiSuccess {Number} data.publication_year Year of publication.
 * @apiSuccess {String} data.original_title Original title of the book.
 * @apiSuccess {String} data.title Full book title.
 * @apiSuccess {Number} data.rating_avg Average rating.
 * @apiSuccess {Number} data.rating_count Total number of ratings.
 * @apiSuccess {Number} data.rating_1_star 1-star rating count.
 * @apiSuccess {Number} data.rating_2_star 2-star rating count.
 * @apiSuccess {Number} data.rating_3_star 3-star rating count.
 * @apiSuccess {Number} data.rating_4_star 4-star rating count.
 * @apiSuccess {Number} data.rating_5_star 5-star rating count.
 * @apiSuccess {String} data.image_url URL to the book's image.
 * @apiSuccess {String} data.image_small_url URL to the small book image.
 *
 * @apiSuccessExample {json} Success Response (Book Found):
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "(1) Book(s) found with ISBN 9780439023480.",
 *       "data": [ { ...book data... } ]
 *     }
 *
 * @apiError (Error 404) {String} message Book not found.
 * @apiErrorExample {json} Error Response (Not Found):
 *     HTTP/1.1 404 Not Found
 *     {
 *       "message": "Book not found."
 *     }
 *
 * @apiError (Error 400) {String} message Invalid ISBN format.
 * @apiErrorExample {json} Error Response (Invalid ISBN):
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "message": "Invalid ISBN format. It should be a 13-digit number."
 *     }
 */
bookRouter.get('/:isbn', getByIsbn);

export { bookRouter };
