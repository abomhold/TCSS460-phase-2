-- Active: 1710457548247@@127.0.0.1@5432@tcss460@public

CREATE TABLE Demo (DemoID SERIAL PRIMARY KEY,
                        Priority INT,
                        Name TEXT NOT NULL UNIQUE,
                        Message TEXT
);

CREATE TABLE Account (Account_ID SERIAL PRIMARY KEY,
                      FirstName VARCHAR(255) NOT NULL,
		              LastName VARCHAR(255) NOT NULL,
                      Username VARCHAR(255) NOT NULL UNIQUE,
                      Email VARCHAR(255) NOT NULL UNIQUE,
                      Phone VARCHAR(15) NOT NULL UNIQUE,
                      Account_Role int NOT NULL
);


CREATE TABLE Account_Credential (Credential_ID SERIAL PRIMARY KEY,
                      Account_ID INT NOT NULL,
                      Salted_Hash VARCHAR(255) NOT NULL,
                      salt VARCHAR(255),
                      FOREIGN KEY(Account_ID) REFERENCES Account(Account_ID)
);

CREATE TABLE BOOKS (id SERIAL PRIMARY KEY,
        isbn13 BIGINT,
        authors TEXT,
        publication_year INT,
        original_title TEXT,
        title TEXT,
        rating_avg FLOAT DEFAULT 0,
        rating_count INT DEFAULT 0,
        rating_1_star INT DEFAULT 0,
        rating_2_star INT DEFAULT 0,
        rating_3_star INT DEFAULT 0,
        rating_4_star INT DEFAULT 0,
        rating_5_star INT DEFAULT 0,
        image_url TEXT,
        image_small_url TEXT
    );

CREATE TABLE RATINGS (
        Account_ID INT,
        book_id INT,
        rating INT,
        FOREIGN KEY(book_id) REFERENCES BOOKS(id),
        PRIMARY KEY (Account_ID, book_id),
        CONSTRAINT check_rating_range CHECK (rating BETWEEN 1 AND 5)
);

COPY books
FROM '/docker-entrypoint-initdb.d/books.csv'
DELIMITER ','
CSV HEADER;

-- This query ensures the auto-incrementing id starts at the next 
-- number after the COPY command above
SELECT SETVAL('books_id_seq', (SELECT MAX(id) FROM books));
