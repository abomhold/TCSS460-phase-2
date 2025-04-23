import { Request, Response } from 'express';
import { pool, validationFunctions } from '../../../core/utilities';

const { isValidIsbn } = validationFunctions;

export const getByIsbn = (req: Request, res: Response) => {
    const { isbn } = req.params;
    const theQuery = 'SELECT * FROM books WHERE isbn13 = $1';
    if (!isValidIsbn(isbn)) {
        res.status(400).json({
            message: 'Invalid ISBN format. It should be a 13-digit number.',
        });
    } else {
        pool.query(theQuery, [isbn])
            .then((result) => {
                if (result.rowCount === 0) {
                    res.status(404).json({
                        message: 'Book not found.',
                    });
                } else {
                    res.status(200).json({
                        message: `(${result.rowCount}) Book(s) found with ISBN ${isbn}.`,
                        data: result.rows,
                    });
                }
            })
            .catch((error) => {
                console.error(
                    'Database query error on GET /book/:isbn\n',
                    error
                );
                res.status(500).json({
                    message: 'An error occurred while fetching the book.',
                });
            });
    }
};
