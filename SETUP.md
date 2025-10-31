# COLLAB HUB - Setup Instructions

## Frontend Setup (React + Vite)

### 1. Install Dependencies
```bash
npm install
# or
bun install
```

### 2. Configure Backend URL
Create a `.env` file in the root directory:
```env
VITE_API_BASE_URL=http://localhost:8080/api
```

Update this URL to match your Java Spring Boot backend.

### 3. Run Development Server
```bash
npm run dev
# or
bun dev
```

The app will be available at `http://localhost:5173`

## Java Spring Boot Backend Requirements

Your backend must implement these REST API endpoints:

### Authentication Endpoints

#### POST `/api/auth/register`
Request body:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "John Doe"
}
```
Response:
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "avatar_url": null,
    "created_at": "2024-01-01T00:00:00Z"
  },
  "token": "jwt_token_here"
}
```

#### POST `/api/auth/login`
Request body:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
Response: Same as register

#### POST `/api/auth/logout`
Headers: `Authorization: Bearer {token}`
Response: `204 No Content`

#### GET `/api/auth/me`
Headers: `Authorization: Bearer {token}`
Response:
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "John Doe",
  "avatar_url": null,
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### POST `/api/auth/reset-password`
Request body:
```json
{
  "email": "user@example.com",
  "newPassword": "newpassword123"
}
```
Response: `200 OK`

### Teams Endpoints

#### GET `/api/teams`
Headers: `Authorization: Bearer {token}`
Response: Array of teams

#### POST `/api/teams`
Headers: `Authorization: Bearer {token}`
Request body:
```json
{
  "name": "Team Name",
  "topic": "Project Topic",
  "description": "Description",
  "capacity": 5
}
```

#### GET `/api/teams/{id}`
Headers: `Authorization: Bearer {token}`
Response: Single team object

#### PUT `/api/teams/{id}`
Headers: `Authorization: Bearer {token}`
Request body: Partial team object

#### DELETE `/api/teams/{id}`
Headers: `Authorization: Bearer {token}`
Response: `204 No Content`

### Team Members Endpoints

#### GET `/api/team-members?teamId={teamId}`
Headers: `Authorization: Bearer {token}`
Response: Array of team members

#### POST `/api/team-members`
Headers: `Authorization: Bearer {token}`
Request body:
```json
{
  "team_id": "uuid",
  "role_name": "Member",
  "pitch": "Why I want to join"
}
```

#### PATCH `/api/team-members/{id}`
Headers: `Authorization: Bearer {token}`
Request body:
```json
{
  "status": "ACCEPTED" // or "REJECTED"
}
```

### Notifications Endpoints

#### GET `/api/notifications`
Headers: `Authorization: Bearer {token}`
Response: Array of user's notifications

#### POST `/api/notifications`
Headers: `Authorization: Bearer {token}`
Request body:
```json
{
  "user_id": "uuid",
  "title": "Notification Title",
  "message": "Notification message",
  "link": "/teams/123"
}
```

#### PATCH `/api/notifications/{id}`
Headers: `Authorization: Bearer {token}`
Request body:
```json
{
  "is_read": true
}
```

#### PATCH `/api/notifications/mark-all-read`
Headers: `Authorization: Bearer {token}`
Response: `200 OK`

## Database Schema (PostgreSQL)

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Should be hashed
    full_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Teams Table
```sql
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    topic VARCHAR(255) NOT NULL,
    description TEXT,
    capacity INT NOT NULL DEFAULT 5,
    owner_id UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Team Members Table
```sql
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id),
    user_id UUID REFERENCES users(id),
    role_name VARCHAR(100) NOT NULL,
    pitch TEXT,
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, ACCEPTED, REJECTED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id, user_id)
);
```

### Notifications Table
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Security Notes

1. **JWT Authentication**: Use Spring Security with JWT tokens
2. **Password Hashing**: Use BCrypt for password hashing
3. **CORS**: Configure CORS to allow requests from `http://localhost:5173` during development
4. **Validation**: Validate all inputs server-side using Bean Validation
5. **Authorization**: Check user ownership before allowing updates/deletes

## Example Spring Boot Configuration

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors()
            .and()
            .csrf().disable()
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .anyRequest().authenticated()
            )
            .sessionManagement()
            .sessionCreationPolicy(SessionCreationPolicy.STATELESS);
        
        return http.build();
    }
}
```

## Development Workflow

1. Start your Java Spring Boot backend on port 8080
2. Start the React frontend with `npm run dev`
3. Frontend will make API calls to `http://localhost:8080/api`
4. JWT tokens are stored in localStorage

## Deployment

1. Update `.env` with your production backend URL
2. Build the frontend: `npm run build`
3. Deploy the `dist` folder to any static hosting (Netlify, Vercel, etc.)
4. Deploy your Spring Boot backend to your preferred cloud provider

## Project Structure

```
collab-hub/
├── src/
│   ├── config/
│   │   └── api.config.ts       # API configuration
│   ├── services/
│   │   ├── api.service.ts      # Base API service
│   │   ├── auth.service.ts     # Authentication
│   │   ├── teams.service.ts    # Teams CRUD
│   │   └── notifications.service.ts
│   ├── contexts/
│   │   └── AuthContext.tsx     # Auth state management
│   ├── pages/
│   │   ├── Auth.tsx           # Login/Signup
│   │   ├── Teams.tsx          # Teams page
│   │   └── ...
│   └── components/
├── .env                        # Environment variables
└── SETUP.md                   # This file
```
