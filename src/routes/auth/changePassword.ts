// changePassword.ts
import express, { Request, Response, Router, NextFunction } from 'express';

import {
    pool,
    validationFunctions,
    credentialingFunctions,
} from '../../core/utilities';

const isStringProvided = validationFunctions.isStringProvided;
const generateHash = credentialingFunctions.generateHash;

const changePasswordRouter: Router = express.Router();

/**
 * @api {put} /password Request to change a user's password
 * @apiName PutPassword
 * @apiGroup Auth
 * 
 * @apiHeader {String} authorization Valid JSON Web Token JWT
 * 
 * @apiBody {String} currentPassword The user's current password
 * @apiBody {String} newPassword The user's new password
 * 
 * @apiSuccess {String} message "Password updated successfully"
 * 
 * @apiError (400: Missing Parameters) {String} message "Missing required information"
 * @apiError (400: Invalid Credentials) {String} message "Current password is incorrect"
 * @apiError (400: Invalid Password) {String} message "New password must be at least 8 characters"
 * @apiError (401: Unauthorized) {String} message "Auth token is required" or "Invalid auth token"
 * @apiError (500: Database Error) {String} message "Server error - contact support"
 */
changePasswordRouter.put(
    '/password',
    // The checkToken middleware will be added in closed/index.ts
    (request: Request, response: Response, next: NextFunction) => {
        // Verify all required fields are provided
        if (
            isStringProvided(request.body.currentPassword) &&
            isStringProvided(request.body.newPassword)
        ) {
            next();
        } else {
            response.status(400).send({
                message: 'Missing required information',
            });
        }
    },
    (request: Request, response: Response, next: NextFunction) => {
        // Validate new password (must be at least 8 characters)
        if (request.body.newPassword.length > 7) {
            next();
        } else {
            response.status(400).send({
                message: 'New password must be at least 8 characters',
            });
        }
    },
    (request: Request, response: Response) => {
        // You need to adjust this to use your specific way of accessing the user ID from the JWT
        // @ts-ignore - Depending on how your checkToken middleware adds the decoded user info
        const userId = request.decoded.id;
        
        // First, verify the current password
        const getCredentialsQuery = `
            SELECT salted_hash, salt FROM Account_Credential
            WHERE account_id=$1
        `;
        
        pool.query(getCredentialsQuery, [userId])
            .then((result) => {
                if (result.rowCount === 0) {
                    response.status(404).send({
                        message: 'User not found',
                    });
                    return;
                }
                
                const salt = result.rows[0].salt;
                const storedSaltedHash = result.rows[0].salted_hash;
                
                // Generate a hash based on the stored salt and the provided current password
                const providedSaltedHash = generateHash(
                    request.body.currentPassword,
                    salt
                );
                
                // Check if the current password is correct
                if (storedSaltedHash === providedSaltedHash) {
                    // Current password is correct, now update with new password
                    const newSaltedHash = generateHash(
                        request.body.newPassword,
                        salt // Using the same salt for simplicity
                    );
                    
                    const updateQuery = `
                        UPDATE Account_Credential
                        SET salted_hash=$1
                        WHERE account_id=$2
                    `;
                    
                    pool.query(updateQuery, [newSaltedHash, userId])
                        .then(() => {
                            response.status(200).send({
                                message: 'Password updated successfully',
                            });
                        })
                        .catch((error) => {
                            console.error('DB Query error on password update');
                            console.error(error);
                            response.status(500).send({
                                message: 'Server error - contact support',
                            });
                        });
                } else {
                    response.status(400).send({
                        message: 'Current password is incorrect',
                    });
                }
            })
            .catch((error) => {
                console.error('DB Query error on password change');
                console.error(error);
                response.status(500).send({
                    message: 'Server error - contact support',
                });
            });
    }
);

export { changePasswordRouter };