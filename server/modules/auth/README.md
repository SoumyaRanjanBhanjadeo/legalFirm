# Authentication System Documentation

## Overview
Domain-feature based authentication system with role-based access control (RBAC) for Legal Firm application.

## Features
- JWT-based authentication (expires in 1 day)
- Role-based access control (Admin & Employee)
- Granular permissions for employees
- Password hashing with bcrypt
- Protected routes with middleware

## User Roles & Permissions

### Admin Role
Has full access to all features:
- ✅ canView
- ✅ canRead
- ✅ canWrite
- ✅ canUpdate
- ✅ canDelete
- ✅ canDownload

### Employee Role
Permissions are assigned by admin during user creation:
- canView: View cases/documents
- canRead: Read case details
- canWrite: Create new cases/records
- canUpdate: Edit existing records
- canDelete: Delete records
- canDownload: Download documents

## API Endpoints

### 1. Login (Public)
```
POST /api/auth/login
Content-Type: application/json

Body:
{
  "email": "admin@legalfirm.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "65f1234567890abcdef12345",
      "name": "Admin User",
      "email": "admin@legalfirm.com",
      "role": "admin",
      "permissions": {
        "canView": true,
        "canRead": true,
        "canWrite": true,
        "canUpdate": true,
        "canDelete": true,
        "canDownload": true
      }
    }
  }
}
```

### 2. Create User (Admin Only)
```
POST /api/auth/create-user
Authorization: Bearer <token>
Content-Type: application/json

Body (Admin):
{
  "name": "John Doe",
  "email": "john@legalfirm.com",
  "password": "password123",
  "role": "admin"
}

Body (Employee with permissions):
{
  "name": "Jane Smith",
  "email": "jane@legalfirm.com",
  "password": "password123",
  "role": "employee",
  "permissions": {
    "canView": true,
    "canRead": true,
    "canWrite": true,
    "canUpdate": false,
    "canDelete": false,
    "canDownload": true
  }
}

Response:
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": {
      "id": "...",
      "name": "Jane Smith",
      "email": "jane@legalfirm.com",
      "role": "employee",
      "permissions": {...},
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### 3. Get Current User (Authenticated)
```
GET /api/auth/me
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "name": "Admin User",
      "email": "admin@legalfirm.com",
      "role": "admin",
      "permissions": {...}
    }
  }
}
```

## Middleware Usage

### Protect Route (Authentication)
```javascript
const { protect } = require('./modules/auth/middleware/authMiddleware');

router.get('/some-route', protect, controllerFunction);
```

### Authorize by Role
```javascript
const { protect, authorize } = require('./modules/auth/middleware/authMiddleware');

// Only admins can access
router.post('/admin-route', protect, authorize('admin'), controllerFunction);

// Both admin and employee can access
router.get('/shared-route', protect, authorize('admin', 'employee'), controllerFunction);
```

### Check Specific Permission
```javascript
const { protect, checkPermission } = require('./modules/auth/middleware/authMiddleware');

// Only users with canWrite permission
router.post('/create-case', protect, checkPermission('canWrite'), controllerFunction);
```

## File Structure
```
server/
└── modules/
    └── auth/
        ├── models/
        │   └── User.js              # User schema with permissions
        ├── controllers/
        │   └── authController.js    # Login, createUser, getMe
        ├── middleware/
        │   └── authMiddleware.js    # protect, authorize, checkPermission
        └── routes/
            └── authRoutes.js        # API routes
```

## Environment Variables
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=1d
```

## Security Features
- Password hashing with bcrypt (salt rounds: 10)
- JWT token expiration (1 day)
- Password not returned in responses
- Account activation/deactivation
- Role-based access control
- Permission checking for employees

## Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "User role 'employee' is not authorized to access this route"
}
```

### 400 Bad Request
```json
{
  "success": false,
  "message": "Please provide name, email, password, and role"
}
```

## Testing with cURL

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@legalfirm.com","password":"password123"}'
```

### Create User (Admin)
```bash
curl -X POST http://localhost:5000/api/auth/create-user \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "New Employee",
    "email": "employee@legalfirm.com",
    "password": "password123",
    "role": "employee",
    "permissions": {
      "canView": true,
      "canRead": true,
      "canWrite": false,
      "canUpdate": false,
      "canDelete": false,
      "canDownload": true
    }
  }'
```
