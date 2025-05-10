import { Response } from 'express';
import { IJwtRequest } from '../../../core/models';
import { pool } from '../../../core/utilities';
import { getUserBookRating } from '../../../core/utilities/sqlUtils';
import { validationFunctions } from '../../../core/utilities';
import {
    IBook,
    IBookDB,
    formatBookResponse,
} from '../../../core/models/book.interface';

const { isNumberProvided } = validationFunctions;
/**
 * Add a rating to a book based on the authenticated user
 *
 * @param req The incoming request with JWT authentication
 * @param res The response object to respond to the user
 */
export const addRating = async (req: IJwtRequest, res: Response) => {
    const userId = req.claims.id;
    const bookId = req.params.bookId;
    const rating = req.body.rating;

    if (!rating || !isNumberProvided(rating)) {
        return res.status(400).json({
            message: 'Rating is not provided in body',
        });
    }

    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
        return res.status(400).json({
            message: 'Rating must be an integer between [1, 5]',
        });
    }

    const client = await pool.connect();

    try {
        // Begin transaction
        await client.query('BEGIN');

        const bookResult = await client.query(
            'SELECT * FROM books WHERE id = $1 FOR UPDATE',
            [bookId]
        );
        if (bookResult.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Book not found.' });
        }

        const book = bookResult.rows[0] as IBookDB;

        const prevRating = await getUserBookRating(userId, bookId);
        if (prevRating) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                message: 'This user has already rated this book',
                previous: prevRating,
            });
        }

        // Update the correct star count
        const updateStarsQuery = `UPDATE books SET rating_${rating}_star = rating_${rating}_star + 1 WHERE id = $1`;
        await client.query(updateStarsQuery, [bookId]);

        // Update count and average
        const newCount = book.rating_count + 1;
        const newAverage =
            (book.rating_avg * book.rating_count + rating) / newCount;

        const updateSummaryQuery = `
            UPDATE books 
            SET rating_count = $1, rating_avg = $2 
            WHERE id = $3
        `;
        await client.query(updateSummaryQuery, [newCount, newAverage, bookId]);

        // Insert rating record
        const insertRatingQuery = 'INSERT INTO ratings VALUES ($1, $2, $3)';
        await client.query(insertRatingQuery, [userId, bookId, rating]);

        await client.query('COMMIT');

        // Retrieve the updated book to format according to our interface
        const updatedBookResult = await client.query(
            'SELECT * FROM books WHERE id = $1',
            [bookId]
        );
        const updatedBook = updatedBookResult.rows[0] as IBookDB;
        const formattedBook: IBook = formatBookResponse(updatedBook);

        return res.status(201).json({
            message: `Updated ratings for book (${bookId})`,
            data: formattedBook,
        });
    } catch (error) {
        // If any error occurs when modifying database, revert any changed made
        await client.query('ROLLBACK');
        console.error('Transaction failed:', error);
        return res.status(500).json({
            message: 'Internal server error - please contact support',
        });
    } finally {
        // Finish transaction
        client.release();
    }
};
