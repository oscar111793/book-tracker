/**
 * Book Status Type
 * Represents the reading status of a book
 */
export type BookStatus = 'READ' | 'UNREAD';

/**
 * Book Interface
 * Defines the structure of a book entity in the system
 * 
 * @property id - Unique identifier (auto-incremented by database)
 * @property title - Book title
 * @property author - Author name
 * @property status - Reading status (READ or UNREAD)
 * @property createdAt - ISO timestamp of when the book was added
 * @property rating - Star rating from 0 to 5 (0 means not rated)
 */
export interface Book {
  id: number;
  title: string;
  author: string;
  status: BookStatus;
  createdAt: string;
  rating: number;
}

