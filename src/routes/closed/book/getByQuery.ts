import { Request, Response } from 'express';
import { pool, validationFunctions } from '../../../core/utilities';

const allowedQueryKeys = ['isbn13', 'authors'];
const { validateQuery } = validationFunctions;

export const getByQuery = async (req: Request, res: Response) => {
    // For every query in the string make sure it is valid
    if (validateQuery(req)) {
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

/**
 * Converts query parameters from a request into a SQL query string and values.
 *
 * @param queryParams The query parameters from the request
 * @returns A tuple containing the SQL query string and an array of values to be used in the query
 */
const queryStringToSQL = (
    queryParams: qs.ParsedQs
): [string | null, unknown[]] => {
    // Build the query dynamically based on provided query parameters
    // Start with basic select all
    let baseQuery = 'SELECT * FROM books';

    // Parse Query Values
    const queryValues = [];
    const queryConditions = Object.keys(queryParams)
        .filter((key) => allowedQueryKeys.includes(key))
        .map((key, index) => {
            queryValues.push(`%${queryParams[key]}%`);
            return `LOWER(CAST(${key} AS TEXT)) LIKE LOWER($${index + 1})`;
        })
        .join(' AND ');

    // Add conditions to the base query
    if (queryConditions.length !== 0) {
        baseQuery += ' WHERE ' + queryConditions;
    }

    // If query contain page information add pagination
    if (queryParams['page'] || queryParams['limit']) {
        const page = Number(queryParams['page']) || 0;
        const limit = Number(queryParams['limit']) || 25;
        const offset = (page - 1) * limit;

        // Add pagination to the base query
        baseQuery += `LIMIT $${queryValues.length + 1} OFFSET $${queryValues.length + 2}`;
        queryValues.push(limit);
        queryValues.push(offset);
    }
    return [baseQuery, queryValues];
};
