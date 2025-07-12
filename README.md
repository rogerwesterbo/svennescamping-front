# Svennes Camping Frontend

A modern React application for managing camping site transactions and bookings, built with React Router and PrimeReact.

## Features

- 🚀 Server-side rendering with React Router
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations
- 🔒 TypeScript by default
- 🎉 TailwindCSS for styling
- � PrimeReact components for rich UI
- 🌍 Environment-based configuration
- 💳 Transaction management with data tables
- 🔗 API integration with fallback mock data

## Environment Configuration

The application uses environment variables for configuration. You need to set up both `.env` and `.env.local` files:

### 1. Copy the example file

```bash
cp .env.example .env
```

### 2. Create your local environment file

Create a `.env.local` file with your actual Google OAuth credentials:

```bash
VITE_API_BASE_URL=http://localhost:8888

# Google OAuth2 Configuration - ACTUAL VALUES (DO NOT COMMIT)
VITE_GOOGLE_CLIENT_ID=your_actual_google_client_id
VITE_GOOGLE_CLIENT_SECRET=your_actual_google_client_secret
```

### Environment Variables

- `VITE_API_BASE_URL`: Base URL for the API backend
- `VITE_GOOGLE_CLIENT_ID`: Google OAuth2 Client ID for authentication
- `VITE_GOOGLE_CLIENT_SECRET`: Google OAuth2 Client Secret for authentication

**Important**: Never commit `.env.local` to git as it contains sensitive credentials. The `.env` file contains only placeholder values and can be safely committed.

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## API Integration

The app expects a REST API with the following endpoints:

- `GET /v1/transactions` - Fetch all transactions
- `GET /v1/transactions/:id` - Fetch a specific transaction
- `POST /v1/transactions` - Create a new transaction
- `PUT /v1/transactions/:id` - Update a transaction
- `DELETE /v1/transactions/:id` - Delete a transaction

### Mock Data

When the API is not available, the app will automatically fall back to mock data for development purposes.

## Building for Production

Create a production build:

```bash
npm run build
```

## Deployment

### Docker Deployment

To build and run using Docker:

```bash
docker build -t my-app .

# Run the container
docker run -p 3000:3000 my-app
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `npm run build`

```
├── package.json
├── package-lock.json (or pnpm-lock.yaml, or bun.lockb)
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

---

Built with ❤️ using React Router.
