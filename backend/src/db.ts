import fs from 'fs';
import path from 'path';
import { Sequelize } from 'sequelize';
import BookModel, { initializeBookModel } from './models/Book';

/**
 * Database Connection Configuration
 * Uses PostgreSQL if DATABASE_URL is provided, otherwise falls back to SQLite for local development
 */
let sequelize: Sequelize;
let Book: typeof BookModel;

if (process.env.DATABASE_URL) {
  // PostgreSQL connection using DATABASE_URL (for production/cloud deployments)
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: process.env.DATABASE_URL?.includes('sslmode=require') ? {
        require: true,
        rejectUnauthorized: false,
      } : false,
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
  });
  console.log('Using PostgreSQL database');
} else {
  // SQLite fallback for local development
  const dbPath = path.join(process.cwd(), 'data', 'books.db');
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
  });
  console.log('Using SQLite database (local development)');
}

// Initialize Book model after sequelize is created
Book = initializeBookModel(sequelize);

/**
 * Initialize Database Connection
 * Tests the connection and syncs the database schema
 */
export const initializeDatabase = async (): Promise<void> => {
  try {
    // Test the connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Sync all models (create tables if they don't exist)
    // In production, you might want to use migrations instead
    await sequelize.sync({ alter: false }); // alter: false means only create if not exists
    console.log('Database tables synced successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
};

/**
 * Close Database Connection
 * Gracefully closes the database connection
 */
export const closeDatabase = async (): Promise<void> => {
  await sequelize.close();
};

// Export sequelize instance for model initialization
export { sequelize };

/**
 * Retrieves all books from the database
 * Returns books sorted by creation date (newest first)
 * 
 * @returns Promise resolving to array of all books
 */
export const getAllBooks = async () => {
  const books = await Book.findAll({
    order: [['createdAt', 'DESC']],
  });
  return books.map((book: BookModel) => ({
    id: book.id,
    title: book.title,
    author: book.author,
    status: book.status,
    createdAt: book.createdAt.toISOString(),
    rating: book.rating,
  }));
};

/**
 * Creates a new book in the database
 * New books are created with status 'UNREAD' and rating 0
 * 
 * @param title - Book title (should be trimmed before calling)
 * @param author - Author name (should be trimmed before calling)
 * @returns Promise resolving to the created book with generated ID
 */
export const createBook = async (title: string, author: string) => {
  const book = await Book.create({
    title: title.trim(),
    author: author.trim(),
    status: 'UNREAD',
    rating: 0,
  });
  return {
    id: book.id,
    title: book.title,
    author: book.author,
    status: book.status,
    createdAt: book.createdAt.toISOString(),
    rating: book.rating,
  };
};

/**
 * Toggles book status between READ and UNREAD
 * Uses Sequelize update with CASE-like logic
 * 
 * @param id - Book ID to toggle
 * @returns Promise resolving to updated book, or null if not found
 */
export const toggleBookStatus = async (id: number) => {
  const book = await Book.findByPk(id);
  if (!book) {
    return null;
  }

  // Toggle status
  const newStatus = book.status === 'READ' ? 'UNREAD' : 'READ';
  await book.update({ status: newStatus });

  return {
    id: book.id,
    title: book.title,
    author: book.author,
    status: book.status,
    createdAt: book.createdAt.toISOString(),
    rating: book.rating,
  };
};

/**
 * Deletes a book from the database
 * 
 * @param id - Book ID to delete
 * @returns Promise resolving to true if book was deleted, false if not found
 */
export const deleteBook = async (id: number): Promise<boolean> => {
  const book = await Book.findByPk(id);
  if (!book) {
    return false;
  }
  await book.destroy();
  return true;
};

/**
 * Updates the star rating for a book
 * Rating must be between 1 and 5 (validated at API level)
 * 
 * @param id - Book ID to update
 * @param rating - New rating value (1-5)
 * @returns Promise resolving to updated book, or null if not found
 */
export const updateBookRating = async (id: number, rating: number) => {
  const book = await Book.findByPk(id);
  if (!book) {
    return null;
  }

  await book.update({ rating });
  return {
    id: book.id,
    title: book.title,
    author: book.author,
    status: book.status,
    createdAt: book.createdAt.toISOString(),
    rating: book.rating,
  };
};
