import { Response } from 'express';
import { validationFunctions } from '../../../core/utilities/validationUtils';
import { IJwtRequest } from '../../../core/models/JwtRequest.model';
import { pool } from '../../../core/utilities/sql_conn'; // Adjust import path as needed

/**
 * Creates a new book in the database
 * @param req Express Request object with JWT claims
 * @param res Express Response object
 * @returns HTTP response with status code and message
 */
export const createBook = async (
    req: IJwtRequest,
    res: Response
): Promise<Response> => {
    try {
        // Get book data from request body
        const { isbn, title, author, year, genre, description, publisher } = req.body;

        // Validate required fields
        if (!validationFunctions.isValidISBN(isbn)) {
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
        
        if (!validationFunctions.isStringProvided(author)) {
            return res.status(400).json({
                success: false,
                message: 'Author is required'
            });
        }
        
        // Validate year if provided
        if (year && !validationFunctions.isNumberProvided(year)) {
            return res.status(400).json({
                success: false,
                message: 'Year must be a valid number'
            });
        }
        
        // Check if book already exists
        const checkQuery = 'SELECT * FROM books WHERE isbn = $1';
        const client = await pool.connect();
        
        try {
            const existingBook = await client.query(checkQuery, [isbn]);
            
            if (existingBook.rowCount > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'Book with this ISBN already exists'
                });
            }
            
            // Insert book into database
            const insertQuery = `
                INSERT INTO books (isbn, title, author, year, genre, description, publisher) 
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *
            `;
            
            const values = [
                isbn, 
                title, 
                author, 
                year || null, 
                genre || null, 
                description || null, 
                publisher || null
            ];
            
            const result = await client.query(insertQuery, values);
            const newBook = result.rows[0];
            
            return res.status(201).json({
                success: true, 
                message: 'Book created successfully',
                data: newBook
            });
        } finally {
            client.release(); // Release the database client back to the pool
        }
        
    } catch (error) {
        console.error('Error creating book:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};