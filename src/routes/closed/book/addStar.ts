import { Request, Response } from "express";
import { IJwtRequest } from "../../../core/models";
import { pool } from "../../../core/utilities";
import { userHasRatedBook } from "../../../core/utilities/sqlUtils";

export const addStar = (req: IJwtRequest, res: Response) => {
    const userId = req.claims.id;
    const bookId = req.params.bookId;

    if (!userId || !bookId) {
        res.status(417).json({
            message: 'Request is not as expected, this should never happen.',
            data: {},
        });
    }
    pool.query('SELECT * FROM books WHERE id = $1', [bookId])
        .then((result) => {
            if (result.rowCount === 0) {
                res.status(404).json({
                    message: 'Book not found.',
                });
            } else {
                const book = result.rows[0];
                userHasRatedBook(userId, bookId)
                    .then((hasLiked) => {
                        const message = `User (${userId}) HAS ${hasLiked ? '' : 'NOT'} rated book (${bookId})`;
                        res.status(201).json({
                            message,
                            data: book
                        })
                    })
                    .catch((error) => {
                        console.log(`Error checking if user has rated book from /${bookId}/stars: ${JSON.stringify(error)}`)
                        res.status(500).json({
                            message: 'Internal server error - please contact support',
                        });
                    });
            }
        })
        .catch((error) => {
            console.log(`Error retrieving book from /${bookId}/stars: ${JSON.stringify(error)}`);
            res.status(500).json({
                message: 'Internal server error - please contact support',
            });
        });
}
