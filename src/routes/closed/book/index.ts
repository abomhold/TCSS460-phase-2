import express, { Router } from 'express';
import { createBook } from './createBook';
import { getByQuery } from './getByQuery';
import { getByBookId } from './getByBookId';

const bookRouter: Router = express.Router();

/**
 * Documentation goes here...
 */

/**
 * @api {post} /c/book Create a new book
 *
 * @apiDescription Creates a new book entry in the database. The ISBN is validated to ensure it is in a proper format (ISBN-10 or ISBN-13).
 * Checks are performed to prevent adding duplicate books with the same ISBN.
 *
 * @apiName CreateBook
 * @apiGroup Book
 * 
 * @apiHeader {String} Authorization JWT token in the format "Bearer {token}"
 *
 * @apiBody {String} isbn ISBN of the book (ISBN-10 or ISBN-13 format)
 * @apiBody {String} title Title of the book
 * @apiBody {String} author Author of the book
 * @apiBody {Number} [year] Publication year of the book
 * @apiBody {String} [genre] Genre of the book
 * @apiBody {String} [description] Description of the book
 * @apiBody {String} [publisher] Publisher of the book
 *
 * @apiSuccess {Boolean} success Indicates if the operation was successful
 * @apiSuccess {String} message Success message
 * @apiSuccess {Object} data The created book object
 * @apiSuccess {String} data.isbn ISBN of the book
 * @apiSuccess {String} data.title Title of the book
 * @apiSuccess {String} data.author Author of the book
 * @apiSuccess {Number} [data.year] Publication year
 * @apiSuccess {String} [data.genre] Genre of the book
 * @apiSuccess {String} [data.description] Description of the book
 * @apiSuccess {String} [data.publisher] Publisher of the book
 *
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 201 Created
 *     {
 *       "success": true,
 *       "message": "Book created successfully",
 *       "data": {
 *         "isbn": "9781234567897",
 *         "title": "Sample Book Title",
 *         "author": "John Doe",
 *         "year": 2023,
 *         "genre": "Fiction",
 *         "description": "A sample book description",
 *         "publisher": "Sample Publisher"
 *       }
 *     }
 *
 * @apiError (Error 400) {Boolean} success false
 * @apiError (Error 400) {String} message Error message
 * @apiErrorExample {json} Error Response (Invalid ISBN):
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "success": false,
 *       "message": "Invalid ISBN format"
 *     }
 *
 * @apiErrorExample {json} Error Response (Missing Title):
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "success": false,
 *       "message": "Title is required"
 *     }
 *
 * @apiErrorExample {json} Error Response (Missing Author):
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "success": false,
 *       "message": "Author is required"
 *     }
 *
 * @apiErrorExample {json} Error Response (Invalid Year):
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "success": false,
 *       "message": "Year must be a valid number"
 *     }
 *
 * @apiError (Error 409) {Boolean} success false
 * @apiError (Error 409) {String} message Error message
 * @apiErrorExample {json} Error Response (Duplicate):
 *     HTTP/1.1 409 Conflict
 *     {
 *       "success": false,
 *       "message": "Book with this ISBN already exists"
 *     }
 *
 * @apiError (Error 500) {Boolean} success false
 * @apiError (Error 500) {String} message Error message
 * @apiErrorExample {json} Error Response (Server Error):
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "success": false,
 *       "message": "Internal server error"
 *     }
 */
//end

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
