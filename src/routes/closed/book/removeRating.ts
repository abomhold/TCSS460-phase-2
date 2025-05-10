import { Response } from 'express';
import { IJwtRequest } from '../../../core/models';
import { pool } from '../../../core/utilities';
import { getUserBookRating } from '../../../core/utilities/sqlUtils';
import {
    IBook,
    IBookDB,
    formatBookResponse,
} from '../../../core/models/book.interface';

/**
 * Removes a rating from a book given a user ID and book ID.
 *
 * @param req The request object containing user ID and book ID.
 * @param res The response object to send the result.
 */
export const removeRating = async (req: IJwtRequest, res: Response) => {
    const userId = req.claims.id;
    const bookId = req.params.bookId;

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

        if (!prevRating) {
            await client.query('ROLLBACK');
            return res
                .status(404)
                .json({ message: 'User has not rated this book.' });
        }

        // Decrement rating_X_star
        await client.query(
            `UPDATE books SET rating_${prevRating}_star = rating_${prevRating}_star - 1 WHERE id = $1`,
            [bookId]
        );

        // Update count and avg
        const newCount = book.rating_count - 1;
        const newAverage =
            newCount === 0
                ? 0
                : (book.rating_avg * book.rating_count - prevRating) / newCount;

        await client.query(
            `UPDATE books SET rating_count = $1, rating_avg = $2 WHERE id = $3`,
            [newCount, newAverage, bookId]
        );

        // Delete rating row
        await client.query(
            `DELETE FROM ratings WHERE account_id = $1 AND book_id = $2`,
            [userId, bookId]
        );

        await client.query('COMMIT');

        // Retrieve the updated book to format according to our interface
        const updatedBookResult = await client.query(
            'SELECT * FROM books WHERE id = $1',
            [bookId]
        );
        const updatedBook = updatedBookResult.rows[0] as IBookDB;
        const formattedBook: IBook = formatBookResponse(updatedBook);

        return res.status(200).json({
            message: 'Rating removed.',
            data: formattedBook,
        });
    } catch (error) {
        // Rollback transaction in case of error
        await client.query('ROLLBACK');
        console.error('Remove transaction failed:', error);
        return res.status(500).json({
            message: 'Internal server error - please contact support',
        });
    } finally {
        client.release();
    }
};
