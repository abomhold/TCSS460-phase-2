/**
 * Interface for book ratings
 * Includes the average rating, count, and individual star counts
 */
export interface IRatings {
    average: number;
    count: number;
    rating_1: number;
    rating_2: number;
    rating_3: number;
    rating_4: number;
    rating_5: number;
}

/**
 * Interface for book icon URLs
 * Includes URLs for large and small book icons/images
 */
export interface IUrlIcon {
    large: string;
    small: string;
}

/**
 * Interface for book data
 * Defines the structure for book objects in HTTP responses
 */
export interface IBook {
    isbn13: number;
    authors: string;
    publication: number; // Publication year
    original_title: string;
    title: string;
    ratings: IRatings;
    icons: IUrlIcon;
}

/**
 * Interface for the database book structure
 * Maps to the BOOKS table structure in PostgreSQL
 */
export interface IBookDB {
    id: number;
    isbn13: number;
    authors: string;
    publication_year: number;
    original_title: string;
    title: string;
    rating_avg: number;
    rating_count: number;
    rating_1_star: number;
    rating_2_star: number;
    rating_3_star: number;
    rating_4_star: number;
    rating_5_star: number;
    image_url: string;
    image_small_url: string;
}

/**
 * Utility function to convert a database book record to the API response format
 * @param dbBook The book record from the database
 * @returns A formatted book object according to the IBook interface
 */
export function formatBookResponse(dbBook: IBookDB): IBook {
    return {
        isbn13: dbBook.isbn13,
        authors: dbBook.authors,
        publication: dbBook.publication_year,
        original_title: dbBook.original_title,
        title: dbBook.title,
        ratings: {
            average: dbBook.rating_avg,
            count: dbBook.rating_count,
            rating_1: dbBook.rating_1_star,
            rating_2: dbBook.rating_2_star,
            rating_3: dbBook.rating_3_star,
            rating_4: dbBook.rating_4_star,
            rating_5: dbBook.rating_5_star,
        },
        icons: {
            large: dbBook.image_url,
            small: dbBook.image_small_url,
        },
    };
}
