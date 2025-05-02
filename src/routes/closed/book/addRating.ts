import { Response } from "express";
import { IJwtRequest } from "../../../core/models";
import { pool } from "../../../core/utilities";
import { getUserBookRating } from "../../../core/utilities/sqlUtils";
import { validationFunctions } from "../../../core/utilities";

const { isNumberProvided } = validationFunctions;

export const addRating = (req: IJwtRequest, res: Response) => {
    const userId = req.claims.id;
    const bookId = req.params.bookId;

    if (!userId || !bookId) {
        res.status(417).json({
            message: 'Request is not as expected, this should never happen.',
            data: {},
        });
    }

    const rating = req.body.rating

    if (!rating || !isNumberProvided(rating)) {
        return res.status(400).json({
            message: "Rating is not provided in body"
        });
    }

    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
        return res.status(400).json({
            message: "Rating must be an integer between [1, 5]"
        })
    }

    pool.query('SELECT * FROM books WHERE id = $1', [bookId])
        .then((result) => {
            if (result.rowCount === 0) {
                res.status(404).json({
                    message: 'Book not found.',
                });
            } else {
                const book = result.rows[0];
                getUserBookRating(userId, bookId)
                    .then((prevRating) => {
                        if (prevRating) {
                            res.status(400).json({
                                message: "This user has already rated this book",
                                data: book,
                            });
                        } else {
                            // TODO: logic to update rating values here...
                            const theQuery = `UPDATE books SET rating_${rating}_star = rating_${rating}_star + 1 WHERE id = $1`
                            pool.query(theQuery, [bookId])
                                .then((result) => {
                                    const theQuery = "INSERT INTO ratings VALUES ($1, $2, $3)";
                                    pool.query(theQuery, [userId, bookId, rating])
                                        .then((result) => {
                                            res.status(201).json({
                                                message: `Updated ratings for book (${bookId})`,
                                            });
                                        })
                                        .catch((error) => {
                                            res.status(500).json({
                                                message: "Internal server error"
                                            });
                                        });
                                })
                                .catch((error) => {
                                    res.status(500).json({
                                        message: "Internal server error"
                                    });
                                });
                        }
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
