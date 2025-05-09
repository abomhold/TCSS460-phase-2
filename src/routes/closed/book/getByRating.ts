import { Request, Response } from 'express';
import { pool } from '../../../core/utilities';
import { isValidRating } from '../../../core/utilities/validationUtils'

export const getByRating = async (req: Request, res: Response) => {
    if (req.query.rating && !isValidRating(req.query.rating)) {
        res.status(400).json({
            message: 'invalid rating format. please provide a valid number 0 - 5.',
            data: [],
        });
    } else {
        const minRating = Number(req.query.rating)
        const theQuery = 'SELECT * FROM books WHERE rating_avg >= $1';

        pool.query(theQuery, [minRating || 0])
            .then((result) => {
                if (result.rowCount === 0) {
                    res.status(404).json({
                        message: 'Book not found.',
                        data: [],
                    });
                } else {
                    res.status(200).json({
                        message: `(${result.rowCount}) Book(s) found.`,
                        data: result.rows, //todo: return book objects
                    });
                }
            })
            .catch((error) => {
                console.error('Error executing query in /book:', error);
                res.status(500).json({
                    message: 'Internal Server Error',
                    data: [],
                });
            });
    }
};
