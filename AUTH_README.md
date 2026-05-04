# Authentication API Documentation

## Database Setup

### Migrations

```bash
# Run migrations
bun run db:migrate

# Reset database (WARNING: deletes all data)
bun run db:reset
```

### Seeding

The project includes a seeder script to populate default users.

**Run the seeder:**

```bash
bun run db:seed
```

**Default users created:**

- **Admin User**
  - Email: `admin@example.com`
  - Password: `admin123`
- **Test User**
  - Email: `test@example.com`
  - Password: `test123`

The seeder is idempotent - running it multiple times won't create duplicate users.

## Endpoints

### 1. Register

**POST** `/api/auth/register`

Register a new user.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "yourpassword"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2026-05-04T00:00:00.000Z"
    },
    "token": "jwt-token-here"
  }
}
```

### 2. Login

**POST** `/api/auth/login`

Login with existing credentials.

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "yourpassword"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    },
    "token": "jwt-token-here"
  }
}
```

### 3. Logout

**POST** `/api/auth/logout`

Logout current user (clears auth cookie).

**Response:**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### 4. Get Current User

**GET** `/api/auth/me`

Get the currently authenticated user's information.

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2026-05-04T00:00:00.000Z"
    }
  }
}
```

## Frontend Usage

### Using the `useAuth` composable

```vue
<script setup>
const { login, register, logout, user, loading } = useAuth();

// Login
const handleLogin = async () => {
  const result = await login({
    email: "john@example.com",
    password: "password123",
  });

  if (result.success) {
    // Redirect or show success message
    navigateTo("/");
  } else {
    // Show error message
    console.error(result.message);
  }
};

// Register
const handleRegister = async () => {
  const result = await register({
    name: "John Doe",
    email: "john@example.com",
    password: "password123",
  });

  if (result.success) {
    navigateTo("/");
  }
};

// Logout
const handleLogout = async () => {
  await logout();
  navigateTo("/login");
};
</script>
```

## Security Features

- ✅ Password hashing using Bun's built-in bcrypt
- ✅ JWT tokens with 7-day expiration
- ✅ HTTP-only cookies for token storage
- ✅ Input validation using Elysia's type system
- ✅ Protected routes with token verification

## Testing

You can test the API using curl:

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -c cookies.txt

# Get current user
curl -X GET http://localhost:3000/api/auth/me \
  -b cookies.txt

# Logout
curl -X POST http://localhost:3000/api/auth/logout \
  -b cookies.txt
```
