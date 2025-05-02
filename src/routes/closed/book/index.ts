import express, { Router } from 'express';
import { createBook } from './createBook';
import { getByQuery } from './getByQuery';
import { getByBookId } from './getByBookId';
import { addRating } from './addRating';

const bookRouter: Router = express.Router();

/**
 * @api {post} /c/book Create a new book
 *
 * @apiDescription Creates a new book entry in the database. The ISBN-13 is validated to ensure it is in proper format.
 * Title and authors are required fields. Optional fields will be stored as NULL if not provided.
 * Duplicate books with the same ISBN are not allowed.
 *
 * @apiName CreateBook
 * @apiGroup Book
 *
 * @apiHeader {String} Authorization JWT token in the format "Bearer {token}"
 *
 * @apiBody {String} isbn13 ISBN-13 of the book (required)
 * @apiBody {String} title Title of the book (required)
 * @apiBody {String} authors Authors of the book (required, comma-separated string if multiple authors)
 * @apiBody {Number} [publication_year] Year the book was published (optional)
 * @apiBody {String} [original_title] Original title of the book if different (optional)
 * @apiBody {String} [image_url] URL to the main book image (optional)
 * @apiBody {String} [image_small_url] URL to the small book image (optional)
 *
 * @apiSuccess (201) {String} message Success message
 * @apiSuccess (201) {Object} data The created book object
 * @apiSuccess {Number} data.id Unique ID of the created book
 * @apiSuccess {String} data.isbn13 ISBN-13 of the book
 * @apiSuccess {String} data.title Title of the book
 * @apiSuccess {String} data.authors Authors of the book
 * @apiSuccess {Number} [data.publication_year] Year the book was published
 * @apiSuccess {String} [data.original_title] Original title
 * @apiSuccess {String} [data.image_url] Main image URL
 * @apiSuccess {String} [data.image_small_url] Small image URL
 *
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 201 Created
 *     {
 *       "message": "Book created successfully",
 *       "data": {
 *         "id": 1,
 *         "isbn13": "9781234567897",
 *         "title": "Sample Book Title",
 *         "authors": "John Doe",
 *         "publication_year": 2023,
 *         "original_title": "Sample Original Title",
 *         "image_url": "https://example.com/book.jpg",
 *         "image_small_url": "https://example.com/book-small.jpg"
 *       }
 *     }
 *
 * @apiError (Error 400) {String} message Invalid or missing fields
 * @apiErrorExample {json} Error Response (Invalid ISBN):
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "message": "Invalid ISBN format"
 *     }
 *
 * @apiErrorExample {json} Error Response (Missing Title):
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "message": "Title is required"
 *     }
 *
 * @apiErrorExample {json} Error Response (Missing Authors):
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "message": "Authors is required"
 *     }
 *
 * @apiError (Error 409) {String} message Book with this ISBN already exists
 * @apiErrorExample {json} Error Response (Duplicate ISBN):
 *     HTTP/1.1 409 Conflict
 *     {
 *       "message": "Book with this ISBN already exists"
 *     }
 *
 * @apiError (Error 500) {String} message Internal server error
 * @apiErrorExample {json} Error Response (Server Error):
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "message": "Internal server error"
 *     }
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
 * @api {get} /c/book/:bookId Get Book by Book ID
 *
 * @apiDescription Retrieves a single book entry by its unique database ID.
 *
 * @apiName GetBookById
 * @apiGroup Book
 *
 * @apiParam {Number} bookId The unique ID of the book to retrieve.
 *
 * @apiSuccess (200) {String} message Description of how many books were found (should be 1).
 * @apiSuccess (200) {Object[]} data Array containing the matching book object.
 * @apiSuccess {Number} data.id Unique ID of the book.
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
 * @apiSuccess {String} data.image_small_url URL to the small book image.
 *
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "(1) Book(s) found.",
 *       "data": [
 *         {
 *           "id": 1,
 *           "isbn13": "9780439023480",
 *           "authors": "Suzanne Collins",
 *           "publication_year": 2008,
 *           "original_title": "The Hunger Games",
 *           "title": "The Hunger Games (The Hunger Games, #1)",
 *           "rating_avg": 4.34,
 *           "rating_count": 4780653,
 *           "rating_1_star": 66715,
 *           "rating_2_star": 127936,
 *           "rating_3_star": 560092,
 *           "rating_4_star": 1481305,
 *           "rating_5_star": 2706317,
 *           "image_url": "https://images.gr-assets.com/books/1447303603m/2767052.jpg",
 *           "image_small_url": "https://images.gr-assets.com/books/1447303603s/2767052.jpg"
 *         }
 *       ]
 *     }
 *
 * @apiError (Error 400) {String} message Invalid Book ID
 * @apiErrorExample {json} Error Response (Invalid Book ID):
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "message": "Invalid Book ID"
 *     }
 *
 * @apiError (Error 404) {String} message Book not found.
 * @apiErrorExample {json} Error Response (Book Not Found):
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
bookRouter.get('/:bookId', getByBookId);
bookRouter.post('/:bookId/rating', addRating)
export { bookRouter };
