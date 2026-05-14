export interface Book {
  bookId: number;
  isbn: string;
  title: string;
  authors: string | null;
  publisher: string | null;
  imgUrl: string | null;
}
