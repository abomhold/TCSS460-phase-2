import { pool } from './sql_conn';

const allowedQueryKeys = ['isbn13', 'authors'];

/**
 * Converts query parameters from a request into a SQL query string and values.
 *
 * @param queryParams The query parameters from the request
 * @param countOnly A boolean indicating whether to generate a count-only query
 * @returns A tuple containing the SQL query string and an array of values to be used in the query
 */
const queryStringToSQL = (
    queryParams: qs.ParsedQs,
    countOnly: boolean = false
): [string, unknown[]] => {
    let baseQuery = countOnly ? 'SELECT COUNT(*) FROM books' : 'SELECT * FROM books';

    const queryValues: unknown[] = [];
    const queryConditions = Object.keys(queryParams)
        .filter((key) => allowedQueryKeys.includes(key))
        .map((key, index) => {
            queryValues.push(`%${queryParams[key]}%`);
            return `LOWER(CAST(${key} AS TEXT)) LIKE LOWER($${index + 1})`;
        })
        .join(' AND ');

    if (queryConditions.length > 0) {
        baseQuery += ' WHERE ' + queryConditions;
    }

    if (!countOnly) {
        const page = Number(queryParams['page']) || 0;
        const limit = Number(queryParams['limit']) || 25;
        const offset = page * limit;

        // Add pagination to the base query
        baseQuery += ` LIMIT $${queryValues.length + 1} OFFSET $${queryValues.length + 2}`;
        queryValues.push(limit);
        queryValues.push(offset);
    }
    return [baseQuery, queryValues];
};

/**
 * Get the rating a user has given a book
 *
 * @param userId the ID of the user
 * @param bookId the ID of the book
 * @returns The users rating of a book or 0 if they have not rated it yet
 */
const getUserBookRating = async (
    userId: string,
    bookId: string
): Promise<number> => {
    const theQuery =
        'SELECT rating FROM ratings WHERE account_id = $1 AND book_id = $2';
    const result = await pool.query(theQuery, [userId, bookId]);
    const rating = result.rowCount > 0 ? result.rows[0].rating : 0;
    return rating;
};

export {
    queryStringToSQL,
    getUserBookRating,
    // Add other exports here as needed
};
