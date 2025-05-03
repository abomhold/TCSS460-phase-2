import { pool } from './sql_conn';

const allowedKeys = ['isbn13', 'authors']; // Define allowed query parameters

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
    const keys = Object.keys(queryParams);

    const queryValues = [];
    const conditions = keys
        .filter((key) => allowedKeys.includes(key))
        .map((key, index) => {
            queryValues.push(`%${queryParams[key]}%`);
            return `LOWER(CAST(${key} AS TEXT)) LIKE LOWER($${index + 1})`;
        })
        .join(' AND ');

    let query = 'SELECT * FROM books';

    if (conditions.length !== 0) {
        query = query + ' WHERE ' + conditions;
    }

    return [query, queryValues];
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
