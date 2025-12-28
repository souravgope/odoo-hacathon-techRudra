# GearGuard - Ultimate Maintenance Tracker

A comprehensive maintenance management system built with the PERN stack (PostgreSQL, Express, React, Node.js) that allows companies to track assets and manage maintenance requests.

## Features

### Core Functionality
- **Equipment Management**: Track all company assets with detailed information
- **Maintenance Teams**: Organize specialized teams (Mechanics, Electricians, IT Support, etc.)
- **Maintenance Requests**: Handle both corrective (breakdown) and preventive (routine) maintenance
- **Kanban Board**: Drag-and-drop interface for managing request stages
- **Calendar View**: Schedule and view preventive maintenance
- **Smart Features**: Auto-fill logic, equipment status tracking, and request filtering

### Key Workflows
1. **The Breakdown Flow**: Create request → Auto-fill team from equipment → Assign → Execute → Complete
2. **The Routine Checkup Flow**: Schedule preventive maintenance → View on calendar → Execute

## Tech Stack

### Backend
- Node.js with Express
- PostgreSQL database
- RESTful API

### Frontend
- React 18
- Tailwind CSS
- Lucide React icons
- Axios for API calls

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the server directory:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gearguard
DB_USER=postgres
DB_PASSWORD=your_password
```

4. Create the PostgreSQL database:
```sql
CREATE DATABASE gearguard;
```

5. The database schema will be automatically created when you start the server.

6. Start the server:
```bash
npm start
# or for development with auto-reload:
npm run dev
```

The server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the client directory (optional, defaults to localhost:5000):
```env
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm start
```

The client will run on `http://localhost:3000`

## Database Schema

### Equipment Table
- Tracks all company assets
- Links to maintenance teams
- Stores purchase date, warranty, location, department

### Teams Table
- Maintenance team information
- Team members stored in separate table

### Requests Table
- Maintenance request lifecycle
- Links to equipment and teams
- Tracks stage, priority, duration, scheduled date

## API Endpoints

### Equipment
- `GET /api/equipment` - Get all equipment
- `GET /api/equipment/:id` - Get single equipment
- `POST /api/equipment` - Create equipment
- `PUT /api/equipment/:id` - Update equipment
- `DELETE /api/equipment/:id` - Delete equipment
- `GET /api/equipment/:id/requests` - Get requests for equipment

### Teams
- `GET /api/teams` - Get all teams
- `GET /api/teams/:id` - Get single team
- `POST /api/teams` - Create team
- `PUT /api/teams/:id` - Update team
- `DELETE /api/teams/:id` - Delete team

### Requests
- `GET /api/requests` - Get all requests (with filters)
- `GET /api/requests/:id` - Get single request
- `POST /api/requests` - Create request
- `PUT /api/requests/:id` - Update request
- `PATCH /api/requests/:id/stage` - Update request stage (for drag-drop)
- `DELETE /api/requests/:id` - Delete request
- `GET /api/requests/stats/overview` - Get statistics

## Features Implementation

### Auto-Fill Logic
When creating a request and selecting equipment, the system automatically:
- Fetches the equipment's maintenance team
- Pre-fills the team field in the request form

### Smart Button
On the Equipment form, clicking the "Maintenance" button:
- Shows all requests related to that specific equipment
- Displays a badge with the count of open requests

### Scrap Logic
When a request is moved to "Scrap" stage:
- The associated equipment is automatically marked as scrapped
- Equipment status is updated in the database

### Drag & Drop
- Requests can be dragged between stages on the Kanban board
- Stage updates are automatically saved to the database

## Project Structure

```
gear_gaurd/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.js
│   │   │   ├── Kanban.js
│   │   │   ├── Calendar.js
│   │   │   ├── Equipment.js
│   │   │   ├── Teams.js
│   │   │   ├── Modal.js
│   │   │   ├── StatCard.js
│   │   │   └── EquipmentRequests.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
├── server/
│   ├── db/
│   │   ├── schema.sql
│   │   └── index.js
│   ├── routes/
│   │   ├── equipment.js
│   │   ├── teams.js
│   │   └── requests.js
│   ├── server.js
│   └── package.json
└── README.md
```

## Development Notes

- The frontend uses Tailwind CSS for styling
- All API calls are centralized in `services/api.js`
- Components are modular and reusable
- Database schema is automatically initialized on server start
- CORS is enabled for development

## License

This project is created for educational purposes.

