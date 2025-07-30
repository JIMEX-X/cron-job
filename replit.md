# CronManager Application

## Overview

CronManager is a full-stack web application built for managing and monitoring cron jobs. It provides a comprehensive dashboard for creating, scheduling, and tracking HTTP-based cron jobs with real-time execution monitoring and detailed logging capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side navigation
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state
- **Forms**: React Hook Form with Zod validation
- **Build Tool**: Vite with custom configuration

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Management**: connect-pg-simple for PostgreSQL session store
- **Job Scheduling**: node-cron for cron job execution
- **API Design**: RESTful API with middleware-based architecture

### Development Setup
- **Monorepo Structure**: Shared code between client and server
- **Hot Reload**: Vite development server with HMR
- **Path Aliases**: Configured for clean imports (@/, @shared/)
- **Type Safety**: Shared TypeScript types between frontend and backend

## Key Components

### Database Schema (Drizzle ORM)
```typescript
// Cron Jobs Table
- id: varchar (primary key)
- url: text (target URL for HTTP requests)
- schedule: text (cron expression)
- cronSecret: text (optional authorization token)
- createdAt: timestamp
- createdBy: text (defaults to "JIMEX-X")
- isActive: boolean

// Execution Logs Table
- id: varchar (auto-generated UUID)
- jobId: varchar (foreign key reference)
- timestamp: timestamp
- status: text ('success' | 'error')
- responseCode: integer (HTTP response code)
- duration: integer (execution time in milliseconds)
- errorMessage: text (error details if failed)
```

### Core Services

#### Storage Layer
- **Interface**: IStorage with methods for CRUD operations
- **Implementation**: MemStorage (in-memory) with plans for database persistence
- **Features**: Job management, execution logging, analytics, health monitoring

#### Cron Service
- **Job Management**: Create, update, delete, and toggle cron jobs
- **Scheduling**: Uses node-cron with support for standard cron expressions
- **Execution**: HTTP POST requests to configured URLs with optional authentication
- **Monitoring**: Real-time execution tracking with success/failure logging

#### API Middleware
- **Authentication**: API key-based authentication
- **Logging**: Request/response logging with duration tracking
- **Error Handling**: Centralized error handling with structured responses

### Frontend Components

#### Dashboard Views
- **Overview**: System stats, health monitoring, recent activity
- **Jobs Management**: CRUD operations with table view and filtering
- **Job Creation**: Form-based job creation with cron expression builder
- **Execution Logs**: Real-time log viewing with filtering and analytics
- **Settings**: API key management and system configuration

#### UI Components
- **Cron Builder**: Visual cron expression builder with presets
- **Stats Grid**: Real-time metrics display
- **Theme Provider**: Dark/light mode support
- **Responsive Design**: Mobile-first approach with sidebar navigation

## Data Flow

### Job Creation Flow
1. User fills out job creation form
2. Frontend validates using Zod schema
3. API request sent to backend with authentication
4. Backend validates and stores job in database
5. Cron job is automatically started
6. Frontend updates with success notification

### Job Execution Flow
1. node-cron triggers job based on schedule
2. HTTP POST request sent to configured URL
3. Response time and status code captured
4. Execution log created with results
5. Frontend polls for updated logs and displays real-time data

### Authentication Flow
- API key required in X-API-Key header
- Environment variable configuration (API_KEY or CRON_API_KEY)
- Fallback to development key for local development

## External Dependencies

### Core Dependencies
- **Database**: @neondatabase/serverless for PostgreSQL connection
- **ORM**: drizzle-orm with drizzle-kit for migrations
- **UI Framework**: @radix-ui/* components for accessible UI primitives
- **HTTP Client**: Built-in fetch for API requests
- **Form Handling**: @hookform/resolvers with zod validation
- **State Management**: @tanstack/react-query for server state
- **Styling**: tailwindcss with postcss for processing

### Development Dependencies
- **Build Tools**: vite, esbuild for production builds
- **Type Checking**: TypeScript with strict configuration
- **Development Server**: Custom Vite setup with Express integration

### Third-party Integrations
- **Replit Integration**: Custom plugins for development environment
- **Session Storage**: PostgreSQL-based session management
- **Error Tracking**: Runtime error overlay for development

## Deployment Strategy

### Build Process
1. **Frontend Build**: Vite builds React app to `dist/public`
2. **Backend Build**: esbuild bundles server code to `dist/index.js`
3. **Database Migration**: Drizzle pushes schema changes to PostgreSQL

### Environment Configuration
- **Development**: NODE_ENV=development with hot reload
- **Production**: NODE_ENV=production with optimized builds
- **Database**: DATABASE_URL for PostgreSQL connection
- **Authentication**: API_KEY for securing endpoints

### Startup Sequence
1. Environment validation (DATABASE_URL required)
2. Database connection and schema verification
3. Express server initialization with middleware
4. Route registration and error handlers
5. Vite development server (development only)
6. Static file serving (production only)

### Scalability Considerations
- In-memory storage is currently used but designed for easy database migration
- Stateless server design allows for horizontal scaling
- Database-backed sessions support multiple server instances
- API-first design enables mobile app development