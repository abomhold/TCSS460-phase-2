import express, { Request, Response, Router, NextFunction, response} from 'express';
import { pool, validationFunctions, credentialingFunctions, } from '../../core/utilities';
import { checkToken } from '../../core/middleware';
import { IJwtRequest } from '../../core/models/JwtRequest.model';

const isStringProvided = validationFunctions.isStringProvided;
const generateHash = credentialingFunctions.generateHash;
const generateSalt = credentialingFunctions.generateSalt;

const passwordRouter: Router = express.Router();

//Add the valid password validation same as the register.ts
const isValidPassword = (password: string): boolean => 
    isStringProvided(password) && password.length > 7;

/**
 * @api {put} /change-password Request to change a user's password
 * @apiName PutChangePassword
 * @apiGroup Auth
 * 
 * @apiHeader {String} authorization Valid JSON Web Token JWT
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     }
 * 
 * @apiBody {String} currentPassword User's current password
 * @apiBody {String} newPassword User's new password (must be > 7 characters)
 * 
 * @apiExample {json} Request Body Example:
 * {
 *   "currentPassword": "OldPassword123!",
 *   "newPassword": "NewPassword456!"
 * }
 *
 * @apiSuccess {boolean} success true when the password is changed
 * @apiSuccess {String} message "Password changed successfully"
 * 
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "success": true,
 *   "message": "Password changed successfully"
 * }
 *
 * @apiError (400: Missing Parameters) {String} message "Missing required information"
 * @apiErrorExample {json} Error-Response: Missing Parameters
 * HTTP/1.1 400 Bad Request
 * {
 *   "success": false,
 *   "message": "Missing required information"
 * }
 * 
 * @apiError (400: Invalid Password) {String} message "Invalid new password - must be at least 8 characters"
 * @apiErrorExample {json} Error-Response: Invalid Password
 * HTTP/1.1 400 Bad Request
 * {
 *   "success": false,
 *   "message": "Invalid new password - must be at least 8 characters"
 * }
 * 
 * @apiError (401: Invalid Credentials) {String} message "Current password is incorrect"
 * @apiErrorExample {json} Error-Response: Invalid Credentials
 * HTTP/1.1 401 Unauthorized
 * {
 *   "success": false,
 *   "message": "Current password is incorrect"
 * }
 * 
 * @apiError (404: User Not Found) {String} message "User not found"
 * @apiErrorExample {json} Error-Response: User Not Found
 * HTTP/1.1 404 Not Found
 * {
 *   "success": false,
 *   "message": "User not found"
 * }
 * 
 * @apiError (500: Database Error) {String} message "Server error - contact support"
 * @apiErrorExample {json} Error-Response: Database Error
 * HTTP/1.1 500 Internal Server Error
 * {
 *   "success": false,
 *   "message": "Server error - contact support"
 * }
 */

passwordRouter.put(
    '/change-password',
    checkToken, //Use JWT validation middleware
    (request: IJwtRequest, response: Response, next: NextFunction) => {
        if (isStringProvided(request.body.currentPassword) && isStringProvided(request.body.newPassword)){
            next();
        } else {
            response.status(400).send({
                sucess: false,
                message: 'Missing required information'
            });
        }
    },
    (request: IJwtRequest, response: Response, next: NextFunction) => {
        if(isValidPassword(request.body.newPassword)) {
            next();
        } else {
            response.status(400).send({
                success: false,
                message: 'Invalid new password - must be at least 8 characters'
            });
        }
    },
    (request: IJwtRequest, response: Response) => {
        const userId = request.claims.id; //Get user ID from JWT claims
        //First we get the current salt and salted hash for the users
        const getCredentialsQuery = `
            SELECT salted_hash, salt
            FROM Account_Credential
            WHERE account_id = $1
        `;
        const getCredentialsValues = [userId];
        pool.query(getCredentialsQuery, getCredentialsValues).then((result) => {
            if (result.rowCount === 0) {
                response.status(404).send({ //no user found with this ID
                    success: false,
                    message: 'User no found'
                });
                return;
            }
            //Get the stored salt and salted hash
            const storedSalt = result.rows[0].salt;
            const storedSaltedHash = result.rows[0].salted_hash;

            //Generate the hash of the provided current password with the stored salt
            const providedSaltedHash = generateHash(
                request.body.currentPassword,
                storedSalt
            );
            if (storedSaltedHash === providedSaltedHash) { //check if current password is correct
                //current password is correct, now it generate new salt and hash for new password
                const newSalt = generateSalt(32);
                const newSaltedHash = generateHash(request.body.newPassword, newSalt);

                // Update the password in the database
                const updateQuery = `
                    UPDATE Account_Credential
                    SET salted_hash = $1, salt = $2
                    WHERE account_id = $3
                `;
                const updateValues = [newSaltedHash, newSalt, userId];
                pool.query(updateQuery, updateValues).then(() => {
                    //Password updated successfully
                    response.status(200).send({
                        success: true,
                        message: 'Password changed successfully'
                    });
                })
                .catch((error) => {
                    //Log the error
                    console.error('DB Query error on password change');
                    console.error(error);
                    response.status(500).send({
                        success: false,
                        message: 'Server error - contact support'
                    });
                });
            } else {
                response.status(401).send({
                    success: false,
                    message: 'Current password is incorrect'
                });
            }
        }).catch((error) => {
            //log the error handling
            console.error('DB Query error on password change');
            console.error(error);
            response.status(500).send({
                success: false,
                message: 'Server error - contact support'
            });
        });
    }
);

export {passwordRouter}