import { Request, Response } from 'express';
import { pool } from '../../../core/utilities';
import { validationFunctions } from '../../../core/utilities';
import { parseBookResult } from '../../../core/utilities/sqlUtils';

const { isNumberProvided } = validationFunctions;

export const getByBookId = (req: Request, res: Response) => {
    const bookId = req.params.bookId;

    if (!isNumberProvided(bookId)) {
        return res.status(400).json({
            message: 'Invalid Book ID',
            data: [],
        });
    }

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
                    data: parseBookResult(result)[0],
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
};
