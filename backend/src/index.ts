import cors from 'cors';
import express from 'express';
import path from 'path';
import {
  createBook,
  deleteBook,
  getAllBooks,
  toggleBookStatus,
  updateBookRating
} from './db';

/**
 * Express Application Setup
 * Creates Express server with CORS enabled and JSON body parsing
 */
const app = express();
const PORT = Number(process.env.PORT) || 4000;

// Enable CORS for frontend communication (only in development)
if (process.env.NODE_ENV !== 'production') {
  app.use(cors());
}
// Parse JSON request bodies
app.use(express.json());

/**
 * GET /api/books
 * Retrieves all books from the database
 * Returns: Array of Book objects sorted by creation date (newest first)
 */
app.get('/api/books', async (_req, res) => {
  try {
    const books = await getAllBooks();
    res.json(books);
  } catch (error) {
    console.error('Failed to fetch books', error);
    res.status(500).json({ message: 'Failed to fetch books' });
  }
});

/**
 * POST /api/books
 * Creates a new book
 * Request body: { title: string, author: string }
 * Returns: Created Book object with generated ID
 * Status: 201 Created, 400 Bad Request (missing fields), 500 Server Error
 */
app.post('/api/books', async (req, res) => {
  try {
    const { title, author } = req.body;
    // Validate required fields
    if (!title || !author) {
      return res.status(400).json({ message: 'Title and author are required' });
    }

    // Trim whitespace and create book
    const book = await createBook(String(title).trim(), String(author).trim());
    res.status(201).json(book);
  } catch (error) {
    console.error('Failed to create book', error);
    res.status(500).json({ message: 'Failed to create book' });
  }
});

/**
 * PATCH /api/books/:id/toggle
 * Toggles book status between READ and UNREAD
 * URL param: id (number)
 * Returns: Updated Book object
 * Status: 200 OK, 400 Bad Request (invalid id), 404 Not Found, 500 Server Error
 */
app.patch('/api/books/:id/toggle', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Invalid book id' });
    }

    const book = await toggleBookStatus(id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json(book);
  } catch (error) {
    console.error('Failed to update book', error);
    res.status(500).json({ message: 'Failed to update book' });
  }
});

/**
 * PATCH /api/books/:id/rating
 * Updates the star rating for a book
 * URL param: id (number)
 * Request body: { rating: number } (1-5)
 * Returns: Updated Book object
 * Status: 200 OK, 400 Bad Request (invalid id/rating), 404 Not Found, 500 Server Error
 */
app.patch('/api/books/:id/rating', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const rating = Number(req.body.rating);

    // Validate ID and rating are numbers
    if (Number.isNaN(id) || Number.isNaN(rating)) {
      return res.status(400).json({ message: 'Invalid id or rating' });
    }
    // Validate rating is in valid range
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const book = await updateBookRating(id, rating);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json(book);
  } catch (error) {
    console.error('Failed to update rating', error);
    res.status(500).json({ message: 'Failed to update rating' });
  }
});

/**
 * DELETE /api/books/:id
 * Deletes a book from the database
 * URL param: id (number)
 * Returns: No content (204)
 * Status: 204 No Content, 400 Bad Request (invalid id), 404 Not Found, 500 Server Error
 */
app.delete('/api/books/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Invalid book id' });
    }

    const deleted = await deleteBook(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // 204 No Content - successful deletion with no response body
    res.status(204).send();
  } catch (error) {
    console.error('Failed to delete book', error);
    res.status(500).json({ message: 'Failed to delete book' });
  }
});

/**
 * Serve static files from frontend/dist in production
 * This allows the Express server to serve the React app
 */
if (process.env.NODE_ENV === 'production') {
  const frontendDistPath = path.join(__dirname, '..', '..', 'frontend', 'dist');
  app.use(express.static(frontendDistPath));

  // Serve React app for all non-API routes (SPA routing)
  app.get('*', (_req, res) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

/**
 * Start the Express server
 * Listens on the configured PORT (default: 4000)
 * Uses process.env.PORT for Render.com dynamic port assignment
 */
app.listen(PORT, () => {
  console.log(`Book Tracker API listening on port ${PORT}`);
  if (process.env.NODE_ENV === 'production') {
    console.log('Serving static files from frontend/dist');
  }
});

