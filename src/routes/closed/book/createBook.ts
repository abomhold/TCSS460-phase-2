import { Response } from 'express';
import { validationFunctions } from '../../../core/utilities/validationUtils';
import { IJwtRequest } from '../../../core/models/JwtRequest.model';
import { pool } from '../../../core/utilities'; // Adjust import path as needed

/**
 * Creates a new book in the database
 * @param req Express Request object with JWT claims
 * @param res Express Response object
 * @returns HTTP response with status code and message
 */
export const createBook = (
    req: IJwtRequest,
    res: Response
) => {
    // Get book data from request body
    const { isbn13, title, authors, publication_year, original_title, image_url, image_small_url } = req.body;

    // Validate required fields
    if (!validationFunctions.isValidISBN(isbn13)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid ISBN format'
        });
    }

    if (!validationFunctions.isStringProvided(title)) {
        return res.status(400).json({
            success: false,
            message: 'Title is required'
        });
    }

    if (!validationFunctions.isStringProvided(authors)) {
        return res.status(400).json({
            success: false,
            message: 'Authors is required'
        });
    }
    // Check if book already exists
    const checkQuery = 'SELECT * FROM books WHERE isbn13 = $1';
    pool.query(checkQuery, [isbn13])
        .then((result) => {
            if (result.rowCount > 0) {
                res.status(409).json({
                    message: 'Book with this ISBN already exists'
                });
            } else {
                const insertQuery = `
                    INSERT INTO books (isbn13, title, authors, publication_year, original_title, image_url, image_small_url)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    RETURNING *`;
                const values = [
                    isbn13,
                    title,
                    authors,
                    publication_year || null,
                    original_title || null,
                    image_url || null,
                    image_small_url || null
                ];
                pool.query(insertQuery, values)
                    .then((result) => {
                        res.status(201).json({
                            message: 'Book created successfully',
                            data: result.rows[0]
                        });
                    })
                    .catch((error) => {
                        console.log('Failed to create book:\n', error)
                        res.status(500).json({
                            message: 'Internal server error'
                        });
                    })
            }
        })
        .catch((error) => {
            console.log('Failed to check if ISBN exists:', error);
            res.status(500).json({
                message: 'Internal server error'
            });
        });
};
