import { Request, Response } from 'express';
import { pool } from '../../../core/utilities';
import { validationFunctions } from '../../../core/utilities';

const { isNumberProvided } = validationFunctions;

export const getByBookId = (req: Request, res: Response) => {
    if (isNumberProvided(req.params.bookId)) {
        const bookId = Number(req.params.bookId);
        pool.query('SELECT * FROM books WHERE id = $1', [bookId])
            .then((result) => {
                if (result.rowCount === 0) {
                    res.status(404).json({
                        message: 'Book not found.',
                        data: [],
                    });
                } else {
                    res.status(200).json({
                        message: `(${result.rowCount}) Book(s) found.`,
                        data: result.rows,
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
    } else {
        res.status(400).json({
            message: 'Book ID must be a number.',
            data: [],
        });
    }
};
