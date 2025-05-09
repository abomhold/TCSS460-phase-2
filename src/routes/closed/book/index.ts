import express, { Router } from 'express';
import { createBook } from './createBook';
import { getByQuery } from './getByQuery';
import { getByBookId } from './getByBookId';
import { addRating } from './addRating';
import { updateRating } from './updateRating';
import { removeRating } from './removeRating';

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
 * @apiSuccess {Number} data.isbn13 ISBN-13 of the book
 * @apiSuccess {String} data.authors Authors of the book
 * @apiSuccess {Number} data.publication Publication year of the book
 * @apiSuccess {String} data.original_title Original title of the book
 * @apiSuccess {String} data.title Title of the book
 * @apiSuccess {Object} data.ratings Book ratings information
 * @apiSuccess {Number} data.ratings.average Average rating (1-5)
 * @apiSuccess {Number} data.ratings.count Total number of ratings
 * @apiSuccess {Number} data.ratings.rating_1 Number of 1-star ratings
 * @apiSuccess {Number} data.ratings.rating_2 Number of 2-star ratings
 * @apiSuccess {Number} data.ratings.rating_3 Number of 3-star ratings
 * @apiSuccess {Number} data.ratings.rating_4 Number of 4-star ratings
 * @apiSuccess {Number} data.ratings.rating_5 Number of 5-star ratings
 * @apiSuccess {Object} data.icons Book image URLs
 * @apiSuccess {String} data.icons.large URL to full-size book image
 * @apiSuccess {String} data.icons.small URL to small book image
 *
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 201 Created
 *     {
 *       "message": "Book created successfully",
 *       "data": {
 *         "isbn13": 9781234567897,
 *         "authors": "John Doe",
 *         "publication": 2023,
 *         "original_title": "Sample Original Title",
 *         "title": "Sample Book Title",
 *         "ratings": {
 *           "average": 0,
 *           "count": 0,
 *           "rating_1": 0,
 *           "rating_2": 0,
 *           "rating_3": 0,
 *           "rating_4": 0,
 *           "rating_5": 0
 *         },
 *         "icons": {
 *           "large": "https://example.com/book.jpg",
 *           "small": "https://example.com/book-small.jpg"
 *         }
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
 * @api {get} /book Request to retrieve book(s) by ISBN13 and/or Author with pagination
 * @apiName GetBookByQuery
 * @apiGroup Book
 *
 * @apiDescription Retrieves book entries filtered by `isbn13` and/or `authors`, with optional pagination.
 * If multiple filters are provided, results must match all (logical AND). If no books match, returns 404.
 * Supports fuzzy matching (partial string match) and paginated results.
 *
 * @apiQuery {String} [isbn13] ISBN-13 of the book (partial match allowed).
 * @apiQuery {String} [authors] Author name (partial match allowed).
 * @apiQuery {Number} [page=0] Page number to return (0-based index).
 * @apiQuery {Number} [limit=25] Number of results per page.
 *
 * @apiSuccess {String} message Description of how many books were found.
 * @apiSuccess {Object[]} data Array of matching book objects.
 * @apiSuccess {Number} data.isbn13 ISBN-13 of the book
 * @apiSuccess {String} data.authors Authors of the book
 * @apiSuccess {Number} data.publication Publication year of the book
 * @apiSuccess {String} data.original_title Original title of the book
 * @apiSuccess {String} data.title Title of the book
 * @apiSuccess {Object} data.ratings Book ratings information
 * @apiSuccess {Number} data.ratings.average Average rating (1-5)
 * @apiSuccess {Number} data.ratings.count Total number of ratings
 * @apiSuccess {Number} data.ratings.rating_1 Number of 1-star ratings
 * @apiSuccess {Number} data.ratings.rating_2 Number of 2-star ratings
 * @apiSuccess {Number} data.ratings.rating_3 Number of 3-star ratings
 * @apiSuccess {Number} data.ratings.rating_4 Number of 4-star ratings
 * @apiSuccess {Number} data.ratings.rating_5 Number of 5-star ratings
 * @apiSuccess {Object} data.icons Book image URLs
 * @apiSuccess {String} data.icons.large URL to full-size book image
 * @apiSuccess {String} data.icons.small URL to small book image
 *
 * @apiSuccess {Object} pagination Pagination metadata.
 * @apiSuccess {Number} pagination.total_count Total number of matching books (not just current page).
 * @apiSuccess {Number} pagination.page Current page number.
 * @apiSuccess {Number} pagination.limit Number of results per page.
 *
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "(2) Book(s) found.",
 *       "data": [
 *         {
 *           "isbn13": 9781234567890,
 *           "authors": "Jane Doe",
 *           "publication": 2020,
 *           "original_title": "Original Title",
 *           "title": "Full Title",
 *           "ratings": {
 *             "average": 4.3,
 *             "count": 10,
 *             "rating_1": 1,
 *             "rating_2": 0,
 *             "rating_3": 2,
 *             "rating_4": 3,
 *             "rating_5": 4
 *           },
 *           "icons": {
 *             "large": "https://example.com/image.jpg",
 *             "small": "https://example.com/small.jpg"
 *           }
 *         }
 *       ],
 *       "pagination": {
 *         "total_count": 52,
 *         "page": 1,
 *         "limit": 25
 *       }
 *     }
 *
 * @apiError (400 Bad Request) {String} message Invalid query parameters.
 * @apiErrorExample {json} Error Response (Invalid Parameters):
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "message": "Invalid query parameters",
 *       "data": []
 *     }
 *
 * @apiError (404 Not Found) {String} message Book not found.
 * @apiErrorExample {json} Error Response (Not Found):
 *     HTTP/1.1 404 Not Found
 *     {
 *       "message": "Book not found.",
 *       "data": [],
 *       "pagination": {
 *         "total_count": 0,
 *         "page": 0,
 *         "limit": 25
 *       }
 *     }
 *
 * @apiError (500 Internal Server Error) {String} message Internal server error.
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
 * @apiSuccess {Number} data.isbn13 ISBN-13 of the book
 * @apiSuccess {String} data.authors Authors of the book
 * @apiSuccess {Number} data.publication Publication year of the book
 * @apiSuccess {String} data.original_title Original title of the book
 * @apiSuccess {String} data.title Title of the book
 * @apiSuccess {Object} data.ratings Book ratings information
 * @apiSuccess {Number} data.ratings.average Average rating (1-5)
 * @apiSuccess {Number} data.ratings.count Total number of ratings
 * @apiSuccess {Number} data.ratings.rating_1 Number of 1-star ratings
 * @apiSuccess {Number} data.ratings.rating_2 Number of 2-star ratings
 * @apiSuccess {Number} data.ratings.rating_3 Number of 3-star ratings
 * @apiSuccess {Number} data.ratings.rating_4 Number of 4-star ratings
 * @apiSuccess {Number} data.ratings.rating_5 Number of 5-star ratings
 * @apiSuccess {Object} data.icons Book image URLs
 * @apiSuccess {String} data.icons.large URL to full-size book image
 * @apiSuccess {String} data.icons.small URL to small book image
 *
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "(1) Book(s) found.",
 *       "data": [
 *         {
 *           "isbn13": 9780439023480,
 *           "authors": "Suzanne Collins",
 *           "publication": 2008,
 *           "original_title": "The Hunger Games",
 *           "title": "The Hunger Games (The Hunger Games, #1)",
 *           "ratings": {
 *             "average": 4.34,
 *             "count": 4780653,
 *             "rating_1": 66715,
 *             "rating_2": 127936,
 *             "rating_3": 560092,
 *             "rating_4": 1481305,
 *             "rating_5": 2706317
 *           },
 *           "icons": {
 *             "large": "https://images.gr-assets.com/books/1447303603m/2767052.jpg",
 *             "small": "https://images.gr-assets.com/books/1447303603s/2767052.jpg"
 *           }
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

/**
 * @api {post} /book/:bookId/rating Add a new rating to a book
 * @apiName AddRating
 * @apiGroup Rating
 *
 * @apiHeader {String} Authorization Bearer token.
 *
 * @apiParam {String} bookId The ID of the book to rate.
 * @apiBody {Number{1-5}} rating The rating to apply (must be an integer between 1 and 5).
 *
 * @apiSuccess (201 Created) {String} message Success message.
 * @apiSuccess (201 Created) {Object} data The updated book object.
 * @apiSuccess {Number} data.isbn13 ISBN-13 of the book
 * @apiSuccess {String} data.authors Authors of the book
 * @apiSuccess {Number} data.publication Publication year of the book
 * @apiSuccess {String} data.original_title Original title of the book
 * @apiSuccess {String} data.title Title of the book
 * @apiSuccess {Object} data.ratings Book ratings information
 * @apiSuccess {Number} data.ratings.average Average rating (1-5)
 * @apiSuccess {Number} data.ratings.count Total number of ratings
 * @apiSuccess {Number} data.ratings.rating_1 Number of 1-star ratings
 * @apiSuccess {Number} data.ratings.rating_2 Number of 2-star ratings
 * @apiSuccess {Number} data.ratings.rating_3 Number of 3-star ratings
 * @apiSuccess {Number} data.ratings.rating_4 Number of 4-star ratings
 * @apiSuccess {Number} data.ratings.rating_5 Number of 5-star ratings
 * @apiSuccess {Object} data.icons Book image URLs
 * @apiSuccess {String} data.icons.large URL to full-size book image
 * @apiSuccess {String} data.icons.small URL to small book image
 *
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 201 Created
 *     {
 *       "message": "Updated ratings for book (123)",
 *       "data": {
 *         "isbn13": 9781234567890,
 *         "authors": "Jane Doe",
 *         "publication": 2020,
 *         "original_title": "Example Original Title",
 *         "title": "Example Book",
 *         "ratings": {
 *           "average": 4.6,
 *           "count": 15,
 *           "rating_1": 0,
 *           "rating_2": 1,
 *           "rating_3": 3,
 *           "rating_4": 1,
 *           "rating_5": 10
 *         },
 *         "icons": {
 *           "large": "https://example.com/book.jpg",
 *           "small": "https://example.com/book-small.jpg"
 *         }
 *       }
 *     }
 *
 * @apiError (400 Bad Request) RatingNotProvided A rating value was not provided in the request body
 * @apiErrorExample {json} Rating Not Provided:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "message": "Rating is not provided in body"
 *     }
 *
 * @apiError (400 Bad Request) RatingInvalid The rating value is not in the correct range or correct type
 * @apiErrorExample {json} Invalid Rating:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "message": "Rating must be an integer between [1, 5]"
 *     }
 *
 * @apiError (400 Bad Request) AlreadyRated The user has already rated this book
 * @apiErrorExample {json} Already Rated:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "message": "This user has already rated this book",
 *       "previous": 4
 *     }
 *
 * @apiError (404 Not Found) BookNotFound The book with the given ID was not found
 * @apiErrorExample {json} Book Not Found:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "message": "Book not found."
 *     }
 *
 * @apiError (500 Internal Server Error) ServerError An error occurred during the transaction
 * @apiErrorExample {json} Server Error:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "message": "Internal server error - please contact support"
 *     }
 */
bookRouter.post('/:bookId/rating', addRating);

/**
 * @api {patch} /book/:bookId/rating Update a user's existing rating for a book
 * @apiName UpdateRating
 * @apiGroup Rating
 *
 * @apiHeader {String} Authorization Bearer token.
 *
 * @apiParam {String} bookId The ID of the book.
 * @apiBody {Number{1-5}} rating The new rating value (must be an integer between 1 and 5).
 *
 * @apiSuccess (200 OK) {String} message Success message.
 * @apiSuccess (200 OK) {Object} data The updated book object.
 * @apiSuccess {Number} data.isbn13 ISBN-13 of the book
 * @apiSuccess {String} data.authors Authors of the book
 * @apiSuccess {Number} data.publication Publication year of the book
 * @apiSuccess {String} data.original_title Original title of the book
 * @apiSuccess {String} data.title Title of the book
 * @apiSuccess {Object} data.ratings Book ratings information
 * @apiSuccess {Number} data.ratings.average Average rating (1-5)
 * @apiSuccess {Number} data.ratings.count Total number of ratings
 * @apiSuccess {Number} data.ratings.rating_1 Number of 1-star ratings
 * @apiSuccess {Number} data.ratings.rating_2 Number of 2-star ratings
 * @apiSuccess {Number} data.ratings.rating_3 Number of 3-star ratings
 * @apiSuccess {Number} data.ratings.rating_4 Number of 4-star ratings
 * @apiSuccess {Number} data.ratings.rating_5 Number of 5-star ratings
 * @apiSuccess {Object} data.icons Book image URLs
 * @apiSuccess {String} data.icons.large URL to full-size book image
 * @apiSuccess {String} data.icons.small URL to small book image
 *
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "Rating updated.",
 *       "data": {
 *         "isbn13": 9781234567890,
 *         "authors": "Jane Doe",
 *         "publication": 2020,
 *         "original_title": "Example Original Title",
 *         "title": "Example Book",
 *         "ratings": {
 *           "average": 4.40,
 *           "count": 9,
 *           "rating_1": 0,
 *           "rating_2": 0,
 *           "rating_3": 1,
 *           "rating_4": 3,
 *           "rating_5": 5
 *         },
 *         "icons": {
 *           "large": "https://example.com/book.jpg",
 *           "small": "https://example.com/book-small.jpg"
 *         }
 *       }
 *     }
 *
 * @apiError (400 Bad Request) InvalidRating The new rating value is not in the correct range or correct type
 * @apiErrorExample {json} Invalid Rating:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "message": "New rating must be an integer between [1, 5]"
 *     }
 *
 * @apiError (400 Bad Request) SameRating The new rating is the same as the previous rating
 * @apiErrorExample {json} Rating Unchanged:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "message": "New rating is the same as the previous rating."
 *     }
 *
 * @apiError (404 Not Found) BookNotFound The book with the given ID was not found
 * @apiErrorExample {json} Book Not Found:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "message": "Book not found."
 *     }
 *
 * @apiError (404 Not Found) NoPreviousRating The user has not rated this book yet
 * @apiErrorExample {json} No Previous Rating:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "message": "User has not rated this book yet."
 *     }
 *
 * @apiError (500 Internal Server Error) ServerError An error occurred during the transaction
 * @apiErrorExample {json} Server Error:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "message": "Internal server error - please contact support"
 *     }
 */
bookRouter.patch('/:bookId/rating', updateRating);

/**
 * @api {delete} /book/:bookId/rating Remove a user's rating for a book
 * @apiName RemoveRating
 * @apiGroup Rating
 *
 * @apiHeader {String} Authorization Bearer token.
 *
 * @apiParam {String} bookId The ID of the book.
 *
 * @apiSuccess (200 OK) {String} message Success message.
 * @apiSuccess (200 OK) {Object} data The updated book object.
 * @apiSuccess {Number} data.isbn13 ISBN-13 of the book
 * @apiSuccess {String} data.authors Authors of the book
 * @apiSuccess {Number} data.publication Publication year of the book
 * @apiSuccess {String} data.original_title Original title of the book
 * @apiSuccess {String} data.title Title of the book
 * @apiSuccess {Object} data.ratings Book ratings information
 * @apiSuccess {Number} data.ratings.average Average rating (1-5)
 * @apiSuccess {Number} data.ratings.count Total number of ratings
 * @apiSuccess {Number} data.ratings.rating_1 Number of 1-star ratings
 * @apiSuccess {Number} data.ratings.rating_2 Number of 2-star ratings
 * @apiSuccess {Number} data.ratings.rating_3 Number of 3-star ratings
 * @apiSuccess {Number} data.ratings.rating_4 Number of 4-star ratings
 * @apiSuccess {Number} data.ratings.rating_5 Number of 5-star ratings
 * @apiSuccess {Object} data.icons Book image URLs
 * @apiSuccess {String} data.icons.large URL to full-size book image
 * @apiSuccess {String} data.icons.small URL to small book image
 *
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "Rating removed.",
 *       "data": {
 *         "isbn13": 9781234567890,
 *         "authors": "Jane Doe",
 *         "publication": 2020,
 *         "original_title": "Example Original Title",
 *         "title": "Example Book",
 *         "ratings": {
 *           "average": 3.75,
 *           "count": 8,
 *           "rating_1": 0,
 *           "rating_2": 1,
 *           "rating_3": 2,
 *           "rating_4": 2,
 *           "rating_5": 3
 *         },
 *         "icons": {
 *           "large": "https://example.com/book.jpg",
 *           "small": "https://example.com/book-small.jpg"
 *         }
 *       }
 *     }
 *
 * @apiError (404 Not Found) BookNotFound Book with the given ID was not found.
 * @apiErrorExample {json} Book Not Found:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "message": "Book not found."
 *     }
 *
 * @apiError (404 Not Found) NoPreviousRating User has not rated this book.
 * @apiErrorExample {json} No Previous Rating:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "message": "User has not rated this book."
 *     }
 *
 * @apiError (500 Internal Server Error) ServerError Something went wrong during the transaction.
 * @apiErrorExample {json} Server Error:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "message": "Internal server error - please contact support"
 *     }
 */
bookRouter.delete('/:bookId/rating', removeRating);

export { bookRouter };