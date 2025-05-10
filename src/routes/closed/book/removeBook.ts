// TODO: Return deleted book details in required format
import { pool } from '../../../core/utilities';
import { Request, Response, NextFunction } from 'express';
import { validationFunctions } from '../../../core/utilities';

const { isValidISBN } = validationFunctions;

export const removeBookByIsbn = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { isbn13 } = req.query;
    if (!isbn13) {
        return next();
    }
    if (!isValidISBN(isbn13 as string)) {
        return res.status(400).json({ error: 'Invalid ISBN format' });
    }
    const query = 'DELETE FROM books WHERE isbn13 = $1 RETURNING *';
    try {
        const result = await pool.query(query, [isbn13]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Books not found' });
        }
        const deletedBooks = result.rows;
        return res.status(200).json({
            message: `(${result.rowCount}) book(s) deleted successfully`,
            data: deletedBooks,
        });
    } catch (error) {
        console.error('Error deleting books at DELETE /c/book?isbn=...', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export const removeBookByAuthors = async (req: Request, res: Response) => {
    const { authors } = req.query;
    if (!authors) {
        return res.status(400).json({ error: 'Authors or ISBN are required' });
    }
    const authorList = (authors as string)
        .split(',')
        .map((author) => author.trim().toLowerCase())
        .join(', ');
    if (authorList.split(', ').join('').length < 3) {
        return res
            .status(400)
            .json({ error: 'Authors must be at least 3 characters long.' });
    }
    const query = 'DELETE FROM books WHERE LOWER(authors) LIKE $1 RETURNING *';
    try {
        const result = await pool.query(query, [`%${authorList}%`]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Books not found' });
        }
        const deletedBooks = result.rows;
        return res.status(200).json({
            message: `(${result.rowCount}) book(s) deleted successfully`,
            data: deletedBooks,
        });
    } catch (error) {
        console.error(
            'Error deleting books at DELETE /c/book?authors=...',
            error
        );
        return res.status(500).json({ error: 'Internal server error' });
    }
};
