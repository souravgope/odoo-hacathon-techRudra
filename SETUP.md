# Quick Setup Guide

## Prerequisites
- Node.js (v14+)
- PostgreSQL (v12+)
- npm or yarn

## Step-by-Step Setup

### 1. Database Setup

First, create the PostgreSQL database:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE gearguard;

# Exit psql
\q
```

### 2. Backend Setup

```bash
cd server
npm install

# Create .env file
# Copy the example and update with your database credentials
# On Windows (PowerShell):
Copy-Item .env.example .env

# On Linux/Mac:
cp .env.example .env

# Edit .env with your database credentials
# Then start the server:
npm start
# or for development:
npm run dev
```

The backend will automatically create the database schema on first run.

### 3. Frontend Setup

```bash
cd client
npm install

# Start the development server
npm start
```

The React app will open at `http://localhost:3000`

## Environment Variables

### Server (.env in server folder)
```
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gearguard
DB_USER=postgres
DB_PASSWORD=your_password_here
```

### Client (.env in client folder - optional)
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Troubleshooting

### Database Connection Issues
- Make sure PostgreSQL is running
- Verify database credentials in `.env`
- Check if the database `gearguard` exists
- Ensure PostgreSQL is listening on the correct port (default: 5432)

### Port Already in Use
- Backend: Change `PORT` in server `.env`
- Frontend: React will prompt to use a different port

### CORS Errors
- Make sure backend is running on port 5000
- Check that the proxy in `client/package.json` matches your backend port

### Tailwind CSS Not Working
- Make sure you've installed dev dependencies: `npm install` in client folder
- Restart the React development server

## First Run

1. Start the backend server first
2. Then start the frontend
3. The database schema will be created automatically
4. You can start adding Equipment, Teams, and Requests through the UI

## Testing the Application

1. Create a Team (e.g., "Mechanics" with members)
2. Create Equipment (assign it to the team)
3. Create a Request (select equipment - team will auto-fill)
4. Try dragging requests between stages on the Kanban board
5. View equipment requests using the "Maintenance" button

