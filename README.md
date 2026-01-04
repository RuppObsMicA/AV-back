# NestJS Authentication & Authorization API

A complete backend application built with NestJS that implements user authentication, role-based authorization, and email confirmation functionality.

## Features

- **User Authentication**: Login and registration with JWT tokens (access + refresh)
- **Role-Based Authorization**: ADMIN, superuser, and normal user roles
- **Email Confirmation**: Email verification flow for new registrations
- **Password Management**: Secure password hashing and reset functionality
- **User Management**: Create, ban, and assign roles to users
- **API Documentation**: Auto-generated Swagger documentation
- **Database Seeding**: Initial roles and data setup

## Tech Stack

- **Framework**: [NestJS](https://nestjs.com/)
- **Database**: PostgreSQL with [Sequelize ORM](https://sequelize.org/)
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Email Service**: Nodemailer
- **Validation**: class-validator & class-transformer
- **API Documentation**: Swagger/OpenAPI
- **Development Email Testing**: MailDev

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd nest.ulbi
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up PostgreSQL database**
```bash
# Create a database named 'nest-course' in PostgreSQL
createdb nest-course
```

4. **Configure environment variables**

The project uses two environment files:
- `.development.env` - for local development
- `.production.env` - for production

Default development settings are already configured. Update if needed:
```env
PORT=5000
POSTGRES_HOST=localhost
POSTGRES_USERNAME=postgres
POSTGRES_DB=nest-course
POSTGRES_PASSWORD=root
POSTGRES_PORT=5432
PRIVATE_KEY=secret_key-safasg

# Mail settings
MAIL_HOST=localhost
MAIL_PORT=1025
MAIL_FROM=noreply@yourapp.com

# Frontend URL
FRONTEND_URL=http://localhost:3001
```

## Running the Application

### Development Mode

```bash
# Start MailDev (for testing emails locally)
npm run maildev
# Access MailDev interface at http://localhost:1080

# Run database seeds (creates initial roles)
npm run seed

# Start the application in development mode
npm run start:dev
```

The API will be available at `http://localhost:5000`

### Production Mode

```bash
# Build the application
npm run build

# Run in production mode
npm run start:prod
```

The API will be available at `http://localhost:7000`

### Other Commands

```bash
# Format code with Prettier
npm run format

# Run linter
npm run lint

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:cov

# Run E2E tests
npm run test:e2e
```

## API Documentation

Once the application is running, access the interactive Swagger documentation at:

**http://localhost:5000/api**

This provides a complete overview of all available endpoints with request/response examples.

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/login` | User login with email and password | No |
| POST | `/auth/registration` | Start user registration (sends confirmation email) | No |
| POST | `/auth/confirmation` | Confirm email and set password | No |
| POST | `/auth/forgot-password` | Request password reset email | No |
| POST | `/auth/reset-password` | Reset password with token | No |

### Users

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/users` | Create a new user | No |
| GET | `/users` | Get all users | ADMIN only |
| POST | `/users/role` | Assign role to user | ADMIN only |
| POST | `/users/ban` | Ban/unban a user | ADMIN only |

### Roles

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/roles` | Create a new role | No |
| GET | `/roles/:value` | Get role by value | No |

## Authentication Flow

### 1. Registration with Email Confirmation

```
User enters email
    ↓
POST /auth/registration { email }
    ↓
System creates pending user + sends confirmation email
    ↓
User clicks link in email (contains hash)
    ↓
POST /auth/confirmation { hash, password }
    ↓
User account activated + password set
    ↓
User can now login
```

### 2. Login

```
POST /auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenExpires": 1234567890,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "roles": [...]
  }
}
```

### 3. Using Protected Endpoints

Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-access-token>
```

## JWT Token Structure

### Access Token (3 hours lifespan)
```json
{
  "id": 1,
  "role": ["ADMIN", "normal"],
  "sessionId": 123456,
  "isTwoFAAuthenticated": false
}
```

### Refresh Token (30 days lifespan)
```json
{
  "sessionId": 123456
}
```

## Role System

The application implements three default roles:

| Role | Value | Description |
|------|-------|-------------|
| Normal User | `normal` | Basic user with standard permissions |
| Superuser | `superuser` | Extended permissions for content management |
| Administrator | `ADMIN` | Full system access |

### Creating Custom Roles

```bash
POST /roles
{
  "value": "moderator",
  "description": "Community moderator"
}
```

## Database Structure

### Users Table
- `id` - Primary key
- `email` - Unique email address
- `password` - Hashed password (bcrypt)
- `banned` - Ban status (boolean)
- `banReason` - Reason for ban
- `confirmationHash` - Email confirmation token
- `confirmationExpires` - Token expiration date
- `status` - Account status (pending/active/banned)

### Roles Table
- `id` - Primary key
- `value` - Role identifier (e.g., 'ADMIN')
- `description` - Role description

### UserRoles Table (Junction)
- `userId` - Foreign key to User
- `roleId` - Foreign key to Role

## Email Testing with MailDev

For local development, the project uses MailDev to test email functionality without sending real emails.

1. **Start MailDev**:
```bash
npm run maildev
```

2. **Access the web interface**:
Open `http://localhost:1080` in your browser

3. **Test email flow**:
- Register a new user via API
- Check MailDev interface for the confirmation email
- Copy the confirmation hash from the email link
- Complete registration with the hash

## Database Seeding

The project includes a seeding system to populate initial data.

**Run seeds**:
```bash
npm run seed
```

This creates:
- 3 default roles (ADMIN, superuser, normal)
- Assigns roles to any existing users without roles

See [SEEDS.md](SEEDS.md) for detailed documentation on the seeding system.

## Security Features

- **Password Hashing**: bcryptjs with 5 salt rounds
- **JWT Secret**: Environment-based secret key
- **Password Exclusion**: User serializer prevents password exposure in API responses
- **Validation Pipeline**: Request validation with class-validator
- **Role Guards**: Route protection based on user roles
- **Email Confirmation**: Prevents unauthorized account creation
- **Token Expiration**: Access tokens expire after 3 hours

## Project Structure

```
src/
├── auth/                   # Authentication module
│   ├── dto/               # Data transfer objects
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   ├── jwt-auth.guard.ts  # JWT authentication guard
│   ├── roles.guard.ts     # Role-based authorization guard
│   └── roles-auth.decorator.ts
├── users/                  # Users module
│   ├── dto/
│   ├── serializers/       # Response serializers
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── users.module.ts
│   └── users.model.ts
├── roles/                  # Roles module
│   ├── dto/
│   ├── roles.controller.ts
│   ├── roles.service.ts
│   ├── roles.module.ts
│   ├── roles.model.ts
│   └── user-roles.model.ts
├── mail/                   # Email service
│   ├── mail.service.ts
│   └── mail.module.ts
├── database/               # Database utilities
│   ├── seeds/             # Database seeds
│   └── seeder.ts
├── common/                 # Shared resources
│   └── dto/               # Common DTOs
├── exceptions/             # Custom exceptions
├── pipes/                  # Custom pipes
├── app.module.ts          # Root module
└── main.ts                # Application entry point
```

## Architecture Patterns

### Module Structure
Each feature follows a consistent pattern:
- **Controller**: HTTP endpoints and request/response handling
- **Service**: Business logic and database operations
- **Model**: Sequelize entity definitions
- **DTOs**: Request validation and API documentation
- **Serializers**: Transform entities to API responses

### Circular Dependencies
Auth and Users modules have circular dependencies resolved with `forwardRef()`:
```typescript
forwardRef(() => AuthModule)
```

### Validation Pattern
All DTOs use class-validator decorators:
```typescript
export class CreateUserDto {
  @IsEmail()
  readonly email: string;

  @Length(4, 16)
  readonly password: string;
}
```

## Development Tips

1. **Always use serializers**: When returning user data, use `UserSerializer.toResponse()` to prevent password exposure
2. **Check environment**: Use `NODE_ENV` to switch between development and production configs
3. **Test emails locally**: Use MailDev instead of real SMTP during development
4. **Run seeds after schema changes**: Ensures roles are always available
5. **Use Swagger docs**: Test endpoints directly from the browser

## Common Issues

### Database connection failed
- Verify PostgreSQL is running
- Check database credentials in `.development.env`
- Ensure database `nest-course` exists

### Emails not sending
- Make sure MailDev is running (`npm run maildev`)
- Check `MAIL_HOST` and `MAIL_PORT` in environment file
- View MailDev web interface at http://localhost:1080

### JWT errors
- Verify `PRIVATE_KEY` is set in environment file
- Check token expiration hasn't passed
- Ensure token is included in Authorization header

## Production Deployment

1. **Update environment variables** in `.production.env`:
   - Use strong `PRIVATE_KEY`
   - Configure real SMTP settings
   - Set correct `FRONTEND_URL`
   - Use secure database credentials

2. **Build the application**:
```bash
npm run build
```

3. **Run database seeds** (first time only):
```bash
NODE_ENV=production npm run seed
```

4. **Start the application**:
```bash
npm run start:prod
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is [UNLICENSED](LICENSE).

## Support

For questions or issues, please open an issue on GitHub.

## Related Documentation

- [NestJS Documentation](https://docs.nestjs.com/)
- [Sequelize Documentation](https://sequelize.org/docs/v6/)
- [JWT Documentation](https://jwt.io/)
- [Swagger/OpenAPI](https://swagger.io/)
