# Docker Setup Guide

This guide explains how to use Docker with this NestJS application.

## Quick Start

### Start all services (app + database + maildev)
```bash
docker-compose up
```

### Start in detached mode (run in background)
```bash
docker-compose up -d
```

### Stop all services
```bash
docker-compose down
```

### Rebuild and start (use after changing Dockerfile or dependencies)
```bash
docker-compose up --build
```

## Available Services

When you run `docker-compose up`, you get three services:

1. **NestJS Application** (app)
   - URL: http://localhost:5000
   - Swagger API: http://localhost:5000/api

2. **PostgreSQL Database** (postgres)
   - Host: localhost
   - Port: 5432
   - Database: nest-course
   - Username: postgres
   - Password: root

3. **MailDev** (maildev)
   - SMTP Server: localhost:1025
   - Web UI: http://localhost:1080

## Common Commands

### View logs from all services
```bash
docker-compose logs -f
```

### View logs from specific service
```bash
docker-compose logs -f app
docker-compose logs -f postgres
```

### Restart a specific service
```bash
docker-compose restart app
```

### Stop and remove containers, networks, and volumes
```bash
docker-compose down -v
```

### Execute commands inside the app container
```bash
# Open shell
docker-compose exec app sh

# Run migrations or seeds
docker-compose exec app npm run seed

# Install new package
docker-compose exec app npm install package-name
```

### Rebuild only the app service
```bash
docker-compose build app
docker-compose up -d app
```

## Development Workflow

1. **First time setup:**
   ```bash
   docker-compose up --build
   ```

2. **Daily development:**
   - Just run `docker-compose up`
   - Code changes auto-reload thanks to volumes and `npm run start:dev`
   - No need to rebuild unless you change package.json or Dockerfile

3. **After adding new npm package:**
   ```bash
   docker-compose down
   docker-compose up --build
   ```

## File Structure

- **Dockerfile.dev** - Development Docker image configuration
- **docker-compose.yml** - Orchestrates all services (app, database, maildev)
- **.dockerignore** - Files to exclude from Docker image

## Troubleshooting

### Port already in use
If you get an error that port 5000, 5432, or 1080 is already in use:
- Stop the local service using that port
- Or change the port mapping in docker-compose.yml (left side of `5000:5000`)

### Database connection issues
If app can't connect to database:
```bash
# Check if postgres is healthy
docker-compose ps

# View postgres logs
docker-compose logs postgres
```

### Code changes not reflecting
- Make sure volumes are mounted correctly
- Restart the app service: `docker-compose restart app`

### Clean slate (remove everything)
```bash
# Stop and remove containers, networks, volumes
docker-compose down -v

# Remove Docker images
docker-compose down --rmi all

# Start fresh
docker-compose up --build
```

## Production Dockerfile

For production, you would create a separate `Dockerfile` (not `Dockerfile.dev`) with:
- Multi-stage build for smaller image
- Only production dependencies
- Built TypeScript code (no source files)
- Proper security hardening
