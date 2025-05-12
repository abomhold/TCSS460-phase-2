import { Request, Response } from 'express';
import { pool } from '../../../core/utilities';
import { isValidRating } from '../../../core/utilities/validationUtils';
import {
    formatBookResponse,
    IBookDB,
} from '../../../core/models/book.interface';

/**
 * Retrieves books with rating equal to or higher than specified value
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const getByRating = async (req: Request, res: Response) => {
    // Check if rating parameter is valid
    if (req.query.rating && !isValidRating(req.query.rating)) {
        res.status(400).json({
            message:
                'invalid rating format. please provide a valid number 0 - 5.',
            data: [],
        });
    } else {
        const minRating = Number(req.query.rating);
        const theQuery = 'SELECT * FROM books WHERE rating_avg >= $1';

        pool.query(theQuery, [minRating || 0])
            .then((result) => {
                if (result.rowCount === 0) {
                    // No books found with the specified rating
                    res.status(404).json({
                        message: 'Book not found.',
                        data: [],
                    });
                } else {
                    // Return found books
                    res.status(200).json({
                        message: `(${result.rowCount}) Book(s) found.`,
                        data: result.rows.map((book) => {
                            const dbBook = book as IBookDB;
                            return formatBookResponse(dbBook);
                        }),
                    });
                }
            })
            .catch((error) => {
                // Log error and return 500 response
                console.error('Error executing query in /book:', error);
                res.status(500).json({
                    message: 'Internal Server Error',
                    data: [],
                });
            });
    }
};
