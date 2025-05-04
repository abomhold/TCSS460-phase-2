import { Request, Response } from 'express';
import {
    pool,
    validationFunctions,
    queryStringToSQL,
} from '../../../core/utilities';

const { isValidISBN } = validationFunctions;

export const getByQuery = async (req: Request, res: Response) => {
    if (req.query.isbn13 && !isValidISBN(req.query.isbn13)) {
        res.status(400).json({
            message:
                'Invalid ISBN format. Please provide a valid 13-digit ISBN.',
            data: [],
        });
    } else {
        const queryParams = req.query;

        const [theQuery, values] = queryStringToSQL(queryParams);

        pool.query(theQuery, values)
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
    }
};

export const getByQueryInPages = async (
    req: Request,
    res: Response,
    pageSize: number,
    offSet: number
) => {
    const queryParams = req.query;
    const [theQuery, values] = queryStringToSQL(queryParams);
    const theQueryWithPagination = theQuery + 'LIMIT $1 OFFSET $2';
    const valuesWithPagination = [...values, pageSize, offSet];
    pool.query(theQueryWithPagination, valuesWithPagination)
        .then((result) => {
            if (result.rowCount === 0) {
                res.status(404).json({
                    message: 'No Books Found For Given Query',
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
};
