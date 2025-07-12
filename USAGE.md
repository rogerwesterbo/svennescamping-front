# Usage Examples

## Environment Setup

Before using the application, you need to configure environment variables:

### 1. Google OAuth Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Create OAuth 2.0 credentials (Web application)
5. Add your domain to authorized origins (e.g., `http://localhost:5173`)
6. Add callback URL to authorized redirect URIs (e.g., `http://localhost:5173/auth/callback`)

### 2. Environment Configuration

Copy your credentials to `.env.local`:

```bash
# Create .env.local with your actual credentials
VITE_GOOGLE_CLIENT_ID=your_actual_client_id_here
VITE_GOOGLE_CLIENT_SECRET=your_actual_client_secret_here
VITE_API_BASE_URL=http://localhost:8888
```

**Security Note**: The `.env.local` file is gitignored and should never be committed to version control.

## Axios API Client with Authentication

This application uses **Axios** with integrated Google OAuth2 authentication for all API calls.

### Why Axios with Authentication?

1. **Automatic Token Management**: Bearer tokens are automatically added to all requests
2. **Better Error Handling**: Axios automatically throws errors for HTTP error status codes (4xx, 5xx)
3. **Request/Response Interceptors**: Perfect for adding auth tokens, logging, and global error handling
4. **Automatic JSON Parsing**: No need to manually call `.json()` on responses
5. **Built-in Timeout Support**: More robust timeout configuration with 10-second default
6. **401 Handling**: Automatically signs out users when tokens are invalid
7. **Better TypeScript Support**: More predictable and type-safe API

### Authentication Features

The authenticated Axios client includes:

- **Automatic Bearer token injection**: Adds `Authorization: Bearer <token>` to all requests
- **Token refresh handling**: Automatically refreshes expired tokens
- **Request/Response logging**: Console logging for debugging
- **Comprehensive error handling**: Handles network errors, auth errors, and API errors
- **Detailed error handling**: Provides clear error messages when API calls fail
- **Configurable auth skip**: Option to skip authentication for public endpoints

## Using the Authenticated Axios API

### Basic Usage

```tsx
import { useAxiosAuthenticatedApi } from "~/hooks/useAxiosAuthenticatedApi";

function MyComponent() {
  const api = useAxiosAuthenticatedApi();

  const fetchTransactions = async () => {
    const result = await api.getTransactions();
    if (result.success) {
      console.log("Transactions:", result.data);
    } else {
      console.error("Error:", result.message);
    }
  };

  return <button onClick={fetchTransactions}>Fetch Data</button>;
}
```

### Advanced Usage with Raw Axios Client

```tsx
import { useAxiosAuthenticatedApi } from "~/hooks/useAxiosAuthenticatedApi";

function AdvancedComponent() {
  const api = useAxiosAuthenticatedApi();

  const makeCustomCall = async () => {
    try {
      // Use the raw axios client for custom requests
      const response = await api.client.get("/custom-endpoint");
      console.log(response.data);

      // POST request with data
      const postResponse = await api.client.post("/users", {
        name: "John Doe",
        email: "john@example.com",
      });

      // Request without authentication
      const publicResponse = await api.client.get("/public-data", {
        skipAuth: true,
      } as any);
    } catch (error) {
      console.error("API call failed:", error);
    }
  };

  return <button onClick={makeCustomCall}>Custom API Call</button>;
}
```

## Environment Setup

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Edit `.env` to configure your API endpoint:

```bash
VITE_API_BASE_URL=http://localhost:3000
```

## API Server Example

Here's a simple Node.js Express server example to work with this frontend:

```javascript
const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// Mock transactions data
const transactions = [
  {
    id: "1",
    amount: 1200.0,
    currency: "USD",
    description: "Monthly camping site rental",
    date: "2024-01-15T10:00:00Z",
    type: "income",
    category: "Accommodation",
    status: "completed",
  },
  // ... more transactions
];

// Get all transactions
app.get("/v1/transactions", (req, res) => {
  res.json(transactions);
});

// Get single transaction
app.get("/v1/transactions/:id", (req, res) => {
  const transaction = transactions.find((t) => t.id === req.params.id);
  if (!transaction) {
    return res.status(404).json({ error: "Transaction not found" });
  }
  res.json(transaction);
});

// Create new transaction
app.post("/v1/transactions", (req, res) => {
  const newTransaction = {
    id: String(transactions.length + 1),
    ...req.body,
  };
  transactions.push(newTransaction);
  res.status(201).json(newTransaction);
});

// Update transaction
app.put("/v1/transactions/:id", (req, res) => {
  const index = transactions.findIndex((t) => t.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Transaction not found" });
  }
  transactions[index] = { ...transactions[index], ...req.body };
  res.json(transactions[index]);
});

// Delete transaction
app.delete("/v1/transactions/:id", (req, res) => {
  const index = transactions.findIndex((t) => t.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Transaction not found" });
  }
  transactions.splice(index, 1);
  res.status(204).send();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## Error Handling

When the API server is not available or returns errors, the frontend will display appropriate error messages. This provides:

1. Clear feedback to users about connection issues
2. Detailed error information for debugging
3. Graceful handling of authentication failures

## Production Deployment

For production, update your `.env.production` file:

```bash
VITE_API_BASE_URL=https://api.your-domain.com
```

Then build and deploy:

```bash
npm run build
npm run start
```
