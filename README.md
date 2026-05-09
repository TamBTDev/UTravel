# UTravel

A full-stack online hotel booking web application built with a modern monorepo architecture. The system covers the complete booking lifecycle — from browsing hotels and selecting rooms to payment processing and booking management.

## Features

**Customer**
- Browse hotels by location, rating, and price; view room details and amenities
- Real-time room availability check
- Secure checkout with multiple payment options
- Booking history and account profile
- Loyalty program and membership tiers

**Staff / Admin**
- Hotel and room management
- Booking management with filtering and status updates
- Revenue and occupancy statistics dashboard
- Customer support dashboard

## Tech Stack

**Client** — React 19, TypeScript, Vite, Tailwind CSS v4, Mantine UI, TanStack Query, React Router v7, Zod, Axios

**Server** — Node.js, Express 5, TypeScript, MySQL / Prisma, JWT authentication, Nodemailer

**Shared** — Common Zod schemas and TypeScript types consumed by both client and server via path aliases in a `shared/` package

## Project Structure

```
UTravel/
├── client/     # React SPA
├── server/     # Express REST API
└── shared/     # Shared schemas, types, and constants
```

## Getting Started

**Prerequisites:** Node.js >= 20, MySQL instance (local or managed), a `.env` file in `server/` with the required variables.

### Installation

```bash
# Install root dependencies
npm install

# Server setup
cd server
npm install
npx prisma migrate dev --name init    # Create database schema
npm run dev                            # Starts on http://localhost:3000

# Client setup (in another terminal)
cd client
npm install
npm run dev                            # Starts on http://localhost:5173
```

### Environment Variables

Create `.env` file in `server/` folder:

```env
DATABASE_URL="mysql://user:password@localhost:3306/utravel_db"
JWT_SECRET="your-secret-key"
NODE_ENV="development"
PORT=3000
```

## Database

Uses MySQL with Prisma ORM for type-safe database operations.

## License

ISC
