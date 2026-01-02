# Database Migration Guide: SQLite to PostgreSQL

The backend has been refactored to support both PostgreSQL (production) and SQLite (local development).

## Installation

After pulling the latest changes, install the new dependencies:

```bash
cd backend
npm install
```

This will install:
- `pg` - PostgreSQL client for Node.js
- `sequelize` - SQL ORM for Node.js
- `@types/pg` - TypeScript types for pg

## Configuration

### Local Development (SQLite)

No configuration needed! The app will automatically use SQLite if `DATABASE_URL` is not set.

The SQLite database file will be created at: `backend/data/books.db`

### Production (PostgreSQL)

Set the `DATABASE_URL` environment variable with your PostgreSQL connection string:

```bash
export DATABASE_URL="postgresql://username:password@host:port/database"
```

Or for Render.com, add it in the Environment Variables section:
- Key: `DATABASE_URL`
- Value: Your PostgreSQL connection string (provided by Render)

## How It Works

1. **Database Selection**: 
   - If `DATABASE_URL` is set → Uses PostgreSQL
   - If `DATABASE_URL` is not set → Falls back to SQLite

2. **Auto-Sync**: 
   - Tables are automatically created on server startup
   - Uses Sequelize's `sync()` method with `alter: false` (safe for production)
   - No manual migrations needed for initial setup

3. **Model Definition**:
   - Book model is defined in `backend/src/models/Book.ts`
   - Uses Sequelize ORM for database operations
   - Supports both PostgreSQL and SQLite dialects

## Testing Locally

1. **With SQLite** (default):
   ```bash
   cd backend
   npm run dev
   ```
   No additional setup needed!

2. **With PostgreSQL** (optional):
   ```bash
   # Set DATABASE_URL
   export DATABASE_URL="postgresql://user:pass@localhost:5432/booktracker"
   
   # Start server
   cd backend
   npm run dev
   ```

## Deployment to Render.com

1. **Create PostgreSQL Database**:
   - In Render dashboard, create a new PostgreSQL database
   - Copy the connection string (Internal Database URL)

2. **Set Environment Variable**:
   - Go to your Web Service settings
   - Add environment variable:
     - Key: `DATABASE_URL`
     - Value: Your PostgreSQL connection string

3. **Deploy**:
   - Push your code
   - Render will automatically:
     - Run `npm run build` (installs dependencies)
     - Run `npm start` (starts server)
     - Tables will be auto-created on first startup

## Migration Notes

- **Existing SQLite Data**: If you have existing data in SQLite, you'll need to export and import it manually to PostgreSQL
- **Schema Compatibility**: The Sequelize model ensures the same schema works for both databases
- **No Breaking Changes**: The API endpoints remain the same, only the database layer changed

## Troubleshooting

### "Cannot find module 'sequelize'"
- Run `npm install` in the backend directory

### Connection Errors
- Check your `DATABASE_URL` format
- For PostgreSQL, ensure the database exists and credentials are correct
- For SQLite, ensure the `data` directory has write permissions

### Table Creation Issues
- Check server logs for sync errors
- Ensure database user has CREATE TABLE permissions (PostgreSQL)
- Check file system permissions (SQLite)


