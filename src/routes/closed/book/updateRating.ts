import { Response } from 'express';
import { IJwtRequest } from '../../../core/models';
import { pool } from '../../../core/utilities';
import { validationFunctions } from '../../../core/utilities';
import { getUserBookRating } from '../../../core/utilities/sqlUtils';
import {
    IBook,
    IBookDB,
    formatBookResponse,
} from '../../../core/models/book.interface';

const { isNumberProvided } = validationFunctions;

/**
 * Update the rating of a book by a user
 *
 * @param req The request sent by the user
 * @param res The response to send information back to the user
 */
export const updateRating = async (req: IJwtRequest, res: Response) => {
    const userId = req.claims.id;
    const bookId = req.params.bookId;
    const newRating = req.body.rating;

    if (
        !newRating ||
        !isNumberProvided(newRating) ||
        newRating < 1 ||
        newRating > 5 ||
        !Number.isInteger(newRating)
    ) {
        return res
            .status(400)
            .json({ message: 'New rating must be an integer between [1, 5]' });
    }

    const client = await pool.connect();

    try {
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
                .json({ message: 'User has not rated this book yet.' });
        }

        if (prevRating === newRating) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                message: 'New rating is the same as the previous rating.',
            });
        }

        // Decrement old rating column
        await client.query(
            `UPDATE books SET rating_${prevRating}_star = rating_${prevRating}_star - 1 WHERE id = $1`,
            [bookId]
        );

        // Increment new rating column
        await client.query(
            `UPDATE books SET rating_${newRating}_star = rating_${newRating}_star + 1 WHERE id = $1`,
            [bookId]
        );

        // Update average
        const newAverage =
            (book.rating_avg * book.rating_count - prevRating + newRating) /
            book.rating_count;
        await client.query(`UPDATE books SET rating_avg = $1 WHERE id = $2`, [
            newAverage,
            bookId,
        ]);

        // Update rating row
        await client.query(
            `UPDATE ratings SET rating = $1 WHERE account_id = $2 AND book_id = $3`,
            [newRating, userId, bookId]
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
            message: 'Rating updated.',
            data: formattedBook,
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Update transaction failed:', error);
        return res.status(500).json({
            message: 'Internal server error - please contact support',
        });
    } finally {
        client.release();
    }
};
