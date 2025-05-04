import { Request, Response } from 'express';
import {
    pool,
    queryStringToSQL,
    validationFunctions,
} from '../../../core/utilities';

export const getByQuery = async (req: Request, res: Response) => {
    if (!validationFunctions.isValidQuery(req)) {
        return res.status(400).json({
            message: 'Invalid query parameters',
            data: [],
        });
    }

    try {
        const queryParams = req.query;

        // Get paginated query
        const [selectQuery, selectValues] = queryStringToSQL(queryParams, false);

        // Get count query
        const [countQuery, countValues] = queryStringToSQL(queryParams, true);

        // Run both queries in parallel
        const [selectResult, countResult] = await Promise.all([
            pool.query(selectQuery, selectValues),
            pool.query(countQuery, countValues),
        ]);

        const page = Number(queryParams['page']) || 0;
        const limit = Number(queryParams['limit']) || 25;
        const totalCount = Number(countResult.rows[0].count);

        if (selectResult.rowCount === 0) {
            return res.status(404).json({
                message: 'Book not found.',
                data: [],
                pagination: {
                    total_count: totalCount,
                    page,
                    limit,
                },
            });
        }

        return res.status(200).json({
            message: `(${selectResult.rowCount}) Book(s) found.`,
            data: selectResult.rows,
            pagination: {
                total_count: totalCount,
                page,
                limit,
            },
        });

    } catch (error) {
        console.error('Error executing query in /book:', error);
        return res.status(500).json({
            message: 'Internal Server Error',
            data: [],
        });
    }
};

