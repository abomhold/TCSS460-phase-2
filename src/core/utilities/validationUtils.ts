/**
 * Checks the parameter to see if it is a a String.
 *
 * @param {unknown} candidate the value to check
 * @returns true if the parameter is a String0, false otherwise
 */
function isString(candidate: unknown): candidate is string {
    return typeof candidate === 'string';
}

/**
 * Checks the parameter to see if it is a a String with a length greater than 0.
 *
 * @param {unknown} candidate the value to check
 * @returns true if the parameter is a String with a length greater than 0, false otherwise
 */
function isStringProvided(candidate: unknown): boolean {
    return isString(candidate) && candidate.length > 0;
}

/**
 * Checks the parameter to see if it can be converted into a number.
 *
 * @param {unknown} candidate the value to check
 * @returns true if the parameter is a number, false otherwise
 */
function isNumberProvided(candidate: unknown): boolean {
    return (
        isNumber(candidate) ||
        (candidate != null &&
            candidate != '' &&
            !isNaN(Number(candidate.toString())))
    );
}

/**
 * Helper
 * @param x data value to check the type of
 * @returns true if the type of x is a number, false otherise
 */
function isNumber(x: unknown): x is number {
    return typeof x === 'number';
}

// Feel free to add your own validations functions!
// for example: isNumericProvided, isValidPassword, isValidEmail, etc
// don't forget to export any

//Sopheanith
/**
 * Validates ISBN format (supports ISBN-10 and ISBN-13)
 * @param isbn The ISBN string to validate
 * @returns boolean indicating if ISBN format is valid
 */
function isValidISBN(isbn: unknown): boolean {
  if (!isStringProvided(isbn)) {
    return false;
  }
  // At this point, we know isbn is a string because isStringProvided checks that remove hyphens or spaces
  const cleanedISBN = (isbn as string).replace(/[-\s]/g, "");

  // Check if it's a valid ISBN-13 (13 digits)
  if (/^\d{13}$/.test(cleanedISBN)) {
    return true;
  }
  // Check if it's a valid ISBN-10 (10 digits or 9 digits followed by X)
  if (/^\d{9}[\dX]$/.test(cleanedISBN)) {
    return true;
  }
  return false;
}

/**
 * Checks that the parameter is a string and matches the ISBN13 format.
 * @param candidate the value to check
 * @returns true if the parameter is a valid ISBN13, false otherwise
 */
function isValidIsbn(candidate: unknown): boolean {
    return (
        isStringProvided(candidate) &&
        RegExp(/^\d{13}$/).test(String(candidate))
    );
}

const validationFunctions = {
    isStringProvided,
    isNumberProvided,
    isValidIsbn,
    isValidISBN, //declared
};

export { validationFunctions };
