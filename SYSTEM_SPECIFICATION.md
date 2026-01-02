# Book Tracker - System Specification

## 1. Overview

**Book Tracker** is a full-stack web application for managing personal reading lists. It allows users to track books they want to read, mark them as read, rate them, and discover random book recommendations.

### 1.1 Technology Stack

- **Backend**: Node.js with Express (TypeScript)
- **Frontend**: React with Vite (TypeScript)
- **Database**: SQLite
- **Styling**: Tailwind CSS
- **Architecture**: RESTful API with separate frontend/backend

### 1.2 Project Structure

```
BookTracker/
├── backend/
│   ├── src/
│   │   ├── index.ts      # Express server & API routes
│   │   ├── db.ts         # Database operations
│   │   └── types.ts      # TypeScript interfaces
│   ├── data/
│   │   └── books.db      # SQLite database file
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── App.tsx       # Main React component
│   │   ├── main.tsx     # React entry point
│   │   ├── types.ts     # TypeScript interfaces
│   │   └── index.css    # Tailwind styles
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
└── SYSTEM_SPECIFICATION.md
```

---

## 2. System Architecture

### 2.1 Backend Architecture

The backend is a RESTful API server built with Express.js that handles all database operations.

**Components:**
- **Express Server** (`index.ts`): Handles HTTP requests, routes, and middleware
- **Database Layer** (`db.ts`): SQLite operations (CRUD)
- **Type Definitions** (`types.ts`): Shared TypeScript interfaces

**Key Features:**
- CORS enabled for frontend communication
- JSON body parsing
- Error handling with appropriate HTTP status codes
- SQLite database with automatic schema migration

### 2.2 Frontend Architecture

The frontend is a single-page application (SPA) built with React.

**Components:**
- **App Component**: Main application component managing all state and UI
- **State Management**: React hooks (useState, useEffect, useRef)
- **API Communication**: Fetch API for HTTP requests

**Key Features:**
- Responsive design with Tailwind CSS
- Real-time UI updates
- Smooth animations and transitions
- Toast notifications

---

## 3. Database Schema

### 3.1 Books Table

```sql
CREATE TABLE books (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'UNREAD',
  createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  rating INTEGER NOT NULL DEFAULT 0
)
```

**Fields:**
- `id`: Auto-incremented primary key
- `title`: Book title (required)
- `author`: Author name (required)
- `status`: Reading status ('READ' or 'UNREAD', default: 'UNREAD')
- `createdAt`: ISO timestamp of creation (auto-generated)
- `rating`: Star rating 0-5 (default: 0, meaning not rated)

**Indexes:**
- Primary key on `id`
- Default ordering: `createdAt DESC` (newest first)

---

## 4. API Specification

### 4.1 Base URL

```
http://localhost:4000/api/books
```

### 4.2 Endpoints

#### GET /api/books

**Description**: Retrieves all books from the database

**Request:**
- Method: `GET`
- Headers: None required
- Body: None

**Response:**
- Status: `200 OK`
- Body: Array of Book objects
```json
[
  {
    "id": 1,
    "title": "The Pragmatic Programmer",
    "author": "Andrew Hunt",
    "status": "UNREAD",
    "createdAt": "2025-12-08T10:00:00.000Z",
    "rating": 0
  }
]
```

**Error Responses:**
- `500 Internal Server Error`: Database error

---

#### POST /api/books

**Description**: Creates a new book

**Request:**
- Method: `POST`
- Headers: `Content-Type: application/json`
- Body:
```json
{
  "title": "Book Title",
  "author": "Author Name"
}
```

**Response:**
- Status: `201 Created`
- Body: Created Book object with generated ID

**Error Responses:**
- `400 Bad Request`: Missing title or author
- `500 Internal Server Error`: Database error

---

#### PATCH /api/books/:id/toggle

**Description**: Toggles book status between READ and UNREAD

**Request:**
- Method: `PATCH`
- URL Parameter: `id` (number)
- Headers: None required
- Body: None

**Response:**
- Status: `200 OK`
- Body: Updated Book object

**Error Responses:**
- `400 Bad Request`: Invalid book ID
- `404 Not Found`: Book not found
- `500 Internal Server Error`: Database error

---

#### PATCH /api/books/:id/rating

**Description**: Updates the star rating for a book

**Request:**
- Method: `PATCH`
- URL Parameter: `id` (number)
- Headers: `Content-Type: application/json`
- Body:
```json
{
  "rating": 5
}
```

**Response:**
- Status: `200 OK`
- Body: Updated Book object

**Error Responses:**
- `400 Bad Request`: Invalid ID or rating (must be 1-5)
- `404 Not Found`: Book not found
- `500 Internal Server Error`: Database error

---

#### DELETE /api/books/:id

**Description**: Deletes a book from the database

**Request:**
- Method: `DELETE`
- URL Parameter: `id` (number)
- Headers: None required
- Body: None

**Response:**
- Status: `204 No Content`
- Body: None

**Error Responses:**
- `400 Bad Request`: Invalid book ID
- `404 Not Found`: Book not found
- `500 Internal Server Error`: Database error

---

## 5. Function Specifications

### 5.1 Backend Functions

#### Database Functions (`db.ts`)

**getAllBooks()**
- **Purpose**: Retrieves all books from database
- **Returns**: `Promise<Book[]>`
- **SQL**: `SELECT * FROM books ORDER BY createdAt DESC`
- **Error Handling**: Rejects promise on database error

**createBook(title: string, author: string)**
- **Purpose**: Creates a new book with default status 'UNREAD' and rating 0
- **Parameters**: 
  - `title`: Book title (trimmed)
  - `author`: Author name (trimmed)
- **Returns**: `Promise<Book>` (created book with generated ID)
- **SQL**: `INSERT INTO books (title, author, status, rating) VALUES (?, ?, 'UNREAD', 0)`
- **Error Handling**: Rejects promise on database error

**toggleBookStatus(id: number)**
- **Purpose**: Toggles status between READ and UNREAD
- **Parameters**: `id`: Book ID
- **Returns**: `Promise<Book | null>` (updated book, or null if not found)
- **SQL**: `UPDATE books SET status = CASE WHEN status = 'READ' THEN 'UNREAD' ELSE 'READ' END WHERE id = ?`
- **Error Handling**: Returns null if book not found, rejects on database error

**deleteBook(id: number)**
- **Purpose**: Deletes a book from database
- **Parameters**: `id`: Book ID
- **Returns**: `Promise<boolean>` (true if deleted, false if not found)
- **SQL**: `DELETE FROM books WHERE id = ?`
- **Error Handling**: Rejects promise on database error

**updateBookRating(id: number, rating: number)**
- **Purpose**: Updates book star rating
- **Parameters**: 
  - `id`: Book ID
  - `rating`: New rating (1-5, validated at API level)
- **Returns**: `Promise<Book | null>` (updated book, or null if not found)
- **SQL**: `UPDATE books SET rating = ? WHERE id = ?`
- **Error Handling**: Returns null if book not found, rejects on database error

---

### 5.2 Frontend Functions

#### App Component Functions (`App.tsx`)

**fetchBooks()**
- **Purpose**: Fetches all books from API on component mount
- **API Call**: `GET /api/books`
- **State Updates**: 
  - Sets `books` with fetched data
  - Sets `loading` to false
  - Sets `error` on failure
- **Error Handling**: Displays error message to user

**handleAdd(event: React.FormEvent)**
- **Purpose**: Handles form submission to add new book
- **Validation**: Checks title and author are not empty (after trim)
- **API Call**: `POST /api/books` with `{ title, author }`
- **State Updates**: 
  - Adds new book to beginning of list
  - Clears form inputs
  - Sets error on failure
- **Error Handling**: Shows validation or API error message

**handleToggle(id: number)**
- **Purpose**: Toggles book reading status
- **API Call**: `PATCH /api/books/:id/toggle`
- **State Updates**: Updates book in list with response data
- **Error Handling**: Shows error message on failure

**handleDelete(id: number)**
- **Purpose**: Deletes a book
- **API Call**: `DELETE /api/books/:id`
- **State Updates**: Removes book from list
- **Error Handling**: Shows error message on failure

**handleRate(id: number, rating: number)**
- **Purpose**: Updates book star rating
- **Parameters**: 
  - `id`: Book ID
  - `rating`: Star rating (1-5)
- **API Call**: `PATCH /api/books/:id/rating` with `{ rating }`
- **State Updates**: Updates book rating in list
- **Error Handling**: Shows error message on failure

**handleSurprise()**
- **Purpose**: Randomly selects an unread book and highlights it
- **Logic**: 
  1. Filters books with status 'UNREAD'
  2. Randomly selects one
  3. Sets `highlightedId` to trigger scroll animation
  4. Shows toast notification
- **State Updates**: 
  - Sets `highlightedId` for animation
  - Sets `toast` message
  - Auto-clears toast after 2.4 seconds
- **Edge Case**: Shows message if no unread books available

**useEffect (Scroll Effect)**
- **Purpose**: Scrolls to highlighted book and removes highlight after 2 seconds
- **Trigger**: When `highlightedId` changes
- **Behavior**: 
  - Smooth scrolls to book card
  - Applies highlight animation
  - Removes highlight after 2 seconds
- **Cleanup**: Clears timeout on unmount

---

## 6. User Interface Specifications

### 6.1 Design Theme

**Cozy Book Cafe Aesthetic**
- Warm beige background (`bg-stone-50`)
- Serif font (Merriweather) for headings
- Soft shadows and rounded corners on cards
- Muted, earthy button colors (sage green, terracotta)
- Index card-like appearance for book cards

### 6.2 Components

#### Header
- **Title**: "Cozy Book Cafe"
- **Subtitle**: "一本書、一杯咖啡，慢慢讀。"
- **Style**: White background with subtle shadow

#### Reading List Section
- **Title**: "Your Reading List"
- **Button**: "Surprise Me" (terracotta color)
- **Layout**: Flex layout with title and button

#### Add Book Form
- **Fields**: 
  - Title input (required)
  - Author input (required)
  - Submit button (sage green)
- **Validation**: Client-side validation for empty fields
- **Style**: Card with rounded corners and soft shadow

#### Book List
- **Layout**: Vertical list of book cards
- **Card Contents**:
  - Book title (bold)
  - Author name
  - Status badge (green for READ, amber for UNREAD)
  - Star rating (5 clickable stars, yellow when selected)
  - Toggle status button
  - Delete button (terracotta)
- **Highlight Animation**: 
  - Shake animation
  - Golden border glow
  - Triggered by Surprise Me feature

#### Toast Notification
- **Position**: Fixed at top-center
- **Style**: Warm background with rounded corners
- **Duration**: Auto-dismiss after 2.4 seconds
- **Content**: "Today's perfect read: [Book Title]"

---

## 7. Data Flow

### 7.1 Book Creation Flow

```
User Input → Form Validation → POST /api/books → Database Insert → 
Response → Update Frontend State → UI Update
```

### 7.2 Status Toggle Flow

```
User Click → PATCH /api/books/:id/toggle → Database Update → 
Response → Update Frontend State → UI Update
```

### 7.3 Rating Update Flow

```
User Click Star → PATCH /api/books/:id/rating → Database Update → 
Response → Update Frontend State → UI Update
```

### 7.4 Surprise Me Flow

```
User Click → Filter Unread Books → Random Selection → 
Set Highlight ID → Scroll Animation → Toast Notification → 
Auto-clear Highlight (2s) → Auto-clear Toast (2.4s)
```

---

## 8. Error Handling

### 8.1 Backend Error Handling

- **400 Bad Request**: Invalid input (missing fields, invalid ID/rating)
- **404 Not Found**: Book ID doesn't exist
- **500 Internal Server Error**: Database or server errors
- All errors return JSON with `message` field

### 8.2 Frontend Error Handling

- **Network Errors**: Displayed in error state
- **API Errors**: Shown as error message below form
- **Validation Errors**: Client-side validation before API call
- **Loading States**: Loading indicator during API calls

---

## 9. Development Setup

### 9.1 Prerequisites

- Node.js (v24.11.1 or compatible)
- npm (v11.6.2 or compatible)

### 9.2 Backend Setup

```bash
cd backend
npm install
npm run dev  # Starts on http://localhost:4000
```

### 9.3 Frontend Setup

```bash
cd frontend
npm install
npm run dev  # Starts on http://localhost:5173 (or next available port)
```

### 9.4 Database

- SQLite database is automatically created at `backend/data/books.db`
- Schema is automatically initialized on first run
- Rating column is added via migration if table exists without it

---

## 10. Testing Recommendations

### 10.1 Manual Testing Checklist

- [ ] Add new book with valid title and author
- [ ] Add book with empty fields (should show error)
- [ ] Toggle book status (READ ↔ UNREAD)
- [ ] Rate book (1-5 stars)
- [ ] Delete book
- [ ] Surprise Me with unread books available
- [ ] Surprise Me with no unread books (should show message)
- [ ] Verify scroll animation works
- [ ] Verify toast notification appears and dismisses
- [ ] Verify highlight animation (shake + golden border)

### 10.2 API Testing

Use tools like Postman or curl to test endpoints:

```bash
# Get all books
curl http://localhost:4000/api/books

# Create book
curl -X POST http://localhost:4000/api/books \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Book","author":"Test Author"}'

# Toggle status
curl -X PATCH http://localhost:4000/api/books/1/toggle

# Update rating
curl -X PATCH http://localhost:4000/api/books/1/rating \
  -H "Content-Type: application/json" \
  -d '{"rating":5}'

# Delete book
curl -X DELETE http://localhost:4000/api/books/1
```

---

## 11. Future Enhancements

Potential features for future development:

1. **Search/Filter**: Filter books by status, rating, or search by title/author
2. **Categories/Tags**: Add categories or tags to books
3. **Reading Progress**: Track reading progress (pages, chapters)
4. **Notes/Reviews**: Add notes or reviews to books
5. **Export**: Export reading list to CSV/JSON
6. **Statistics**: Reading statistics dashboard
7. **Book Covers**: Add book cover images (via API like Open Library)
8. **User Authentication**: Multi-user support with authentication
9. **Sorting Options**: Sort by title, author, rating, date added
10. **Bulk Operations**: Select multiple books for bulk actions

---

## 12. Code Comments

All code files have been annotated with English comments explaining:
- Purpose of functions and components
- Parameter descriptions
- Return value descriptions
- Error handling behavior
- Important implementation details

Refer to individual source files for detailed inline documentation.

---

**Document Version**: 1.0  
**Last Updated**: December 8, 2025




