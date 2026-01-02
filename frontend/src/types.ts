/**
 * Book Status Type
 * Represents the reading status of a book
 */
export type BookStatus = 'READ' | 'UNREAD';

/**
 * Book Interface
 * Defines the structure of a book entity (matches backend interface)
 * 
 * @property id - Unique identifier
 * @property title - Book title
 * @property author - Author name
 * @property status - Reading status (READ or UNREAD)
 * @property createdAt - ISO timestamp string
 * @property rating - Star rating from 0 to 5
 */
export interface Book {
  id: number;
  title: string;
  author: string;
  status: BookStatus;
  createdAt: string;
  rating: number;
}

