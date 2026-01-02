import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';
import { Book, BookStatus } from './types';

/**
 * Database Configuration
 * Sets up SQLite database file path and ensures data directory exists
 */
const dbPath = path.join(process.cwd(), 'data', 'books.db');
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const sqlite = sqlite3.verbose();
const db = new sqlite.Database(dbPath);

/**
 * Database Schema Initialization
 * Creates the books table if it doesn't exist and ensures rating column exists
 * This handles both new installations and migrations for existing databases
 */
db.serialize(() => {
  // Create main books table with core fields
  db.run(`
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'UNREAD',
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Add rating column for existing databases (migration support)
  // Errors are ignored as column may already exist
  db.run(`ALTER TABLE books ADD COLUMN rating INTEGER NOT NULL DEFAULT 0`, () => {
    // ignore errors (column may already exist)
  });
});

/**
 * Maps database row to Book interface
 * Converts raw SQLite row data to typed Book object
 * 
 * @param row - Raw database row object
 * @returns Book object with proper types
 */
const mapRowToBook = (row: any): Book => ({
  id: row.id,
  title: row.title,
  author: row.author,
  status: row.status as BookStatus,
  createdAt: row.createdAt,
  rating: Number(row.rating ?? 0),
});

/**
 * Retrieves all books from the database
 * Returns books sorted by creation date (newest first)
 * 
 * @returns Promise resolving to array of all books
 */
export const getAllBooks = (): Promise<Book[]> => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM books ORDER BY createdAt DESC', (err: Error | null, rows: any[]) => {
      if (err) return reject(err);
      resolve(rows.map(mapRowToBook));
    });
  });
};

/**
 * Creates a new book in the database
 * New books are created with status 'UNREAD' and rating 0
 * 
 * @param title - Book title (should be trimmed before calling)
 * @param author - Author name (should be trimmed before calling)
 * @returns Promise resolving to the created book with generated ID
 */
export const createBook = (title: string, author: string): Promise<Book> => {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare('INSERT INTO books (title, author, status, rating) VALUES (?, ?, ?, ?)');
    stmt.run(title, author, 'UNREAD', 0, function (this: sqlite3.RunResult, err: Error | null) {
      if (err) return reject(err);
      // Fetch the newly created book to return complete object
      db.get('SELECT * FROM books WHERE id = ?', [this.lastID], (getErr: Error | null, row: any) => {
        if (getErr) return reject(getErr);
        resolve(mapRowToBook(row));
      });
    });
  });
};

/**
 * Toggles book status between READ and UNREAD
 * Uses SQL CASE statement to flip the status
 * 
 * @param id - Book ID to toggle
 * @returns Promise resolving to updated book, or null if not found
 */
export const toggleBookStatus = (id: number): Promise<Book | null> => {
  return new Promise((resolve, reject) => {
    db.run(
      `
        UPDATE books
        SET status = CASE WHEN status = 'READ' THEN 'UNREAD' ELSE 'READ' END
        WHERE id = ?
      `,
      [id],
      function (this: sqlite3.RunResult, err: Error | null) {
        if (err) return reject(err);
        // If no rows were updated, book doesn't exist
        if (this.changes === 0) return resolve(null);

        // Fetch updated book to return
        db.get('SELECT * FROM books WHERE id = ?', [id], (getErr: Error | null, row: any) => {
          if (getErr) return reject(getErr);
          resolve(row ? mapRowToBook(row) : null);
        });
      }
    );
  });
};

/**
 * Deletes a book from the database
 * 
 * @param id - Book ID to delete
 * @returns Promise resolving to true if book was deleted, false if not found
 */
export const deleteBook = (id: number): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM books WHERE id = ?', [id], function (this: sqlite3.RunResult, err: Error | null) {
      if (err) return reject(err);
      // this.changes indicates number of rows affected
      resolve(this.changes > 0);
    });
  });
};

/**
 * Updates the star rating for a book
 * Rating must be between 1 and 5 (validated at API level)
 * 
 * @param id - Book ID to update
 * @param rating - New rating value (1-5)
 * @returns Promise resolving to updated book, or null if not found
 */
export const updateBookRating = (id: number, rating: number): Promise<Book | null> => {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE books SET rating = ? WHERE id = ?`,
      [rating, id],
      function (this: sqlite3.RunResult, err: Error | null) {
        if (err) return reject(err);
        // If no rows were updated, book doesn't exist
        if (this.changes === 0) return resolve(null);

        // Fetch updated book to return
        db.get('SELECT * FROM books WHERE id = ?', [id], (getErr: Error | null, row: any) => {
          if (getErr) return reject(getErr);
          resolve(row ? mapRowToBook(row) : null);
        });
      }
    );
  });
};

