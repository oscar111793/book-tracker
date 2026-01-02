# Deployment Guide for Render.com

This guide explains how to deploy the Book Tracker application to Render.com.

## Prerequisites

1. A Render.com account
2. Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)

## Deployment Steps

### 1. Prepare Your Repository

Ensure all files are committed and pushed to your repository:
- Root `package.json` with build script
- `render.yaml` configuration file
- All backend and frontend source files

### 2. Create a New Web Service on Render

1. Log in to [Render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your repository
4. Render will automatically detect the `render.yaml` configuration

### 3. Configuration

The `render.yaml` file is already configured with:
- **Build Command**: `npm run build` (installs dependencies and builds both frontend and backend)
- **Start Command**: `cd backend && npm start` (runs the compiled backend server)
- **Environment Variables**: Automatically set `NODE_ENV=production` and `PORT`

### 4. Manual Configuration (if not using render.yaml)

If you prefer manual setup:

**Build Command:**
```bash
npm run build
```

**Start Command:**
```bash
cd backend && npm start
```

**Environment Variables:**
- `NODE_ENV`: `production`
- `PORT`: Automatically assigned by Render (no need to set manually)

### 5. How It Works

1. **Build Process**:
   - Installs dependencies for both backend and frontend
   - Builds frontend React app (outputs to `frontend/dist`)
   - Compiles backend TypeScript (outputs to `backend/dist`)

2. **Runtime**:
   - Backend Express server starts on Render's assigned PORT
   - In production mode, Express serves static files from `frontend/dist`
   - All API routes (`/api/*`) are handled by Express
   - All other routes serve the React app (SPA routing)

3. **Database**:
   - SQLite database is created at `backend/data/books.db`
   - **Note**: On Render's free tier, the filesystem is ephemeral. Consider upgrading or using a persistent database for production.

## Important Notes

### Database Persistence

⚠️ **Warning**: Render's free tier uses an ephemeral filesystem. Your SQLite database will be lost when the service restarts or redeploys.

**Solutions**:
1. **Upgrade to a paid plan** with persistent disk storage
2. **Use an external database** (PostgreSQL, MySQL) with Render's managed database service
3. **Use a cloud storage service** for the database file (S3, etc.)

### Environment Variables

The app automatically:
- Uses `process.env.PORT` for the server port (required by Render)
- Detects production mode via `NODE_ENV=production`
- Serves static files only in production mode

### CORS Configuration

- CORS is **disabled in production** (same origin)
- CORS is **enabled in development** (for local frontend on different port)

## Testing Locally

Before deploying, test the production build locally:

```bash
# Build everything
npm run build

# Start the production server
cd backend
npm start
```

Then visit `http://localhost:4000` (or the PORT you set).

## Troubleshooting

### Build Fails

- Check that all dependencies are listed in `package.json`
- Ensure Node.js version is compatible (18+)
- Check build logs for specific errors

### App Doesn't Load

- Verify the build completed successfully
- Check that `frontend/dist` directory exists after build
- Check server logs for errors

### API Calls Fail

- Verify API routes are working: `https://your-app.onrender.com/api/books`
- Check browser console for CORS errors (shouldn't happen in production)
- Ensure API_BASE is using relative paths in production

### Database Issues

- Check that `backend/data` directory has write permissions
- Verify SQLite3 native bindings are installed correctly
- Consider using a managed database service

## Post-Deployment

After successful deployment:

1. Test all features:
   - Add a book
   - Toggle status
   - Rate a book
   - Delete a book
   - Use "Surprise Me" feature

2. Monitor logs in Render dashboard

3. Set up auto-deploy from your main branch (optional)

## Support

For issues specific to:
- **Render.com**: Check [Render Documentation](https://render.com/docs)
- **Application**: Review `SYSTEM_SPECIFICATION.md` for architecture details


