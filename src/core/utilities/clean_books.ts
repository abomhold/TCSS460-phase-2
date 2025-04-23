import fs from 'fs';

interface IRatings {
    average: number;
    count: number;
    rating_1: number;
    rating_2: number;
    rating_3: number;
    rating_4: number;
    rating_5: number;
}

interface IUrlIcon {
    large: string;
    small: string;
}

interface IBook {
    book_id: number;
    isbn13: number;
    authors: string;
    publication: number;
    original_title: string;
    title: string;
    ratings: IRatings;
    icons: IUrlIcon;
}

function parseBookCSV(file: string): IBook[] {
    const fileContents: string = fs.readFileSync(file, 'utf-8');
    const lines: string[] = fileContents.split('\n');
    lines.shift(); // Remove the header line
    const books: IBook[] = lines.map(parseLine);
    const isSequential: boolean = books.every(
        (thiz: IBook, i: number, collection: IBook[]): boolean =>
            !i || thiz.book_id === collection[i - 1].book_id + 1
    );
    console.log(
        'One book object per csv line: ' + (lines.length === books.length)
    );
    console.log('Book ids are sequential: ' + isSequential);
    return books;
}

function parseLine(line: string): IBook {
    const re = new RegExp(
        [
            /(\d+)/, // book id
            /(\d+)/, // isbn13
            /("[^"]*(?:""[^"]*)*"|[^,]*)/, // authors
            /(-?\d+)/, // publication date
            /("[^"]*(?:""[^"]*)*"|[^,]*)/, // original title
            /("[^"]*(?:""[^"]*)*"|[^,]*)/, // title
            /(\d+(?:\.\d+)?)/, // average rating
            /(\d+)/, // ratings count
            /(\d+)/, // ratings_1
            /(\d+)/, // ratings_2
            /(\d+)/, // ratings_3
            /(\d+)/, // ratings_4
            /(\d+)/, // ratings_5
            /([^,]+)/, // image url
            /([^,]+)$/, // small image url
        ]
            .map(function (r) {
                return r.source;
            })
            .join(',') // Delimiter
    );

    const values = re.exec(line);

    if (!values || values.length != 16) {
        console.error(`[${line}] ${line}: ${values}`);
        return null;
    }

    return {
        book_id: parseInt(values[1]),
        isbn13: parseInt(values[2]),
        authors: String(values[3]),
        publication: parseInt(values[4]),
        original_title: String(values[5]),
        title: String(values[6]),
        ratings: {
            average: parseFloat(values[7]),
            count: parseInt(values[8]),
            rating_1: parseInt(values[9]),
            rating_2: parseInt(values[10]),
            rating_3: parseInt(values[11]),
            rating_4: parseInt(values[12]),
            rating_5: parseInt(values[13]),
        },
        icons: {
            large: String(values[14]),
            small: String(values[15]),
        },
    };
}

if (require.main === module) {
    for (const book of parseBookCSV('books.csv')) {
        if (book.title != book.original_title)
            console.log(book.title + '\n\t' + book.original_title);
    }
}
