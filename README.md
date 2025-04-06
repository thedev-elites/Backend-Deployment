# CareerWise Backend

This is the backend API server for the CareerWise job application platform. It provides RESTful endpoints for managing users, jobs, resumes, and job applications.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)

## Setup

1. Install dependencies:
   ```
   cd backend
   npm install
   ```

2. Set up environment variables:
   - Rename `.env.example` to `.env` or create a new `.env` file
   - Update the MongoDB connection string and JWT secret if needed

3. Start MongoDB (if using local installation):
   ```
   mongod
   ```

4. Run the development server:
   ```
   npm run dev
   ```

The server will start on http://localhost:5000 by default.

## API Endpoints

### Authentication
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login and get JWT token
- `GET /api/users/me` - Get current user profile (requires authentication)

### Jobs
- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/:id` - Get job by ID
- `POST /api/jobs` - Create a new job (admin only)
- `PATCH /api/jobs/:id` - Update job (admin only)
- `DELETE /api/jobs/:id` - Delete job (admin only)

### Resumes
- `GET /api/resumes/me` - Get current user's resume
- `POST /api/resumes` - Create or update user's resume
- `DELETE /api/resumes` - Delete user's resume

### Applications
- `GET /api/applications` - Get all applications for current user
- `GET /api/applications/:id` - Get application by ID
- `POST /api/applications/jobs/:jobId/apply` - Apply for a job
- `PATCH /api/applications/:id/status` - Update application status (admin only)

## Authentication

The API uses JWT (JSON Web Token) for authentication. To access protected routes, include the token in the request headers:

```
Authorization: Bearer <your_token>
```

You'll receive a token when you register or login. The token expires after 90 days by default.

## Error Handling

Errors are returned in a consistent format:

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Error message"
}
```

## Development vs Production

In development mode, error responses include the full error stack trace. In production, only operational errors expose their details while programming errors return a generic message.

## Connecting to the Frontend

The frontend is configured to connect to this backend at `http://localhost:5000/api`. Make sure both the frontend and backend are running simultaneously when testing the full application.

## Seeding Data

To populate the database with initial data (useful for testing), run:

```
npm run seed
```

This will create sample users, jobs, and other data based on the frontend's mock data. 