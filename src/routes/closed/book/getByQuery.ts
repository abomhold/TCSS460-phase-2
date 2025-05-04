import { Request, Response } from 'express';
import {
    pool,
    queryStringToSQL,
    validationFunctions,
} from '../../../core/utilities';

export const getByQuery = async (req: Request, res: Response) => {
    // For every query in the string make sure it is valid
    if (validationFunctions.isValidQuery(req)) {
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
    } else {
        res.status(400).json({
            message: 'Invalid query parameters',
            data: [],
        });
    }
};
