# Node Express Server

This is the backend server for the RelySelfie Demo App. It is built using Node.js and Express.js and serves as a proxy for handling image uploads to the GraphQL endpoint.

## Features

- Handles image uploads from the frontend.
- Proxies requests to the GraphQL API.
- Configurable via environment variables.
- CORS support for secure cross-origin requests.

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Navigate to the `server` directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Environment Variables

The server uses the following environment variables for configuration:

```env
GRAPHQL_URL=<hidden># RelyComply GraphQL API endpoint
AUTH_TOKEN=your-auth-token # Authentication token for the GraphQL API
CSRF_TOKEN=your-csrf-token # CSRF token for the GraphQL API
CORS_ORIGIN=http://localhost:3000 # Allowed origin for CORS
PORT=5999 # Port on which the server runs
```

Create a `.env` file in the `server` directory and populate it with the above variables.

## Scripts

### Start the Server

To start the server in development mode:
```bash
node index.js
```

The server will run on the port specified in the `PORT` environment variable (default: 5999).

## API Endpoints

### POST `/api/upload-images`

**Description:**
Handles image uploads from the frontend and proxies them to the GraphQL API.

**Request Body:**
```json
{
  "images": ["base64-encoded-image-1", "base64-encoded-image-2"],
  "customerId": "customer-id"
}
```

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "data": {
        "createDocument": {
          "document": {
            "id": "document-id",
            "created": "timestamp",
            "format": "image/jpeg",
            "presignedUrl": "url-to-uploaded-image"
          }
        }
      }
    }
  ]
}
```

**Error Response:**
```json
{
  "error": "Error message"
}
```

## Proxy for GraphQL Uploads

The server acts as a proxy for uploading images to the GraphQL API. This ensures secure communication and abstracts the GraphQL API details from the frontend.

## CORS Configuration

The server uses the `CORS_ORIGIN` environment variable to allow cross-origin requests from the specified origin. Update this variable to match the origin of your frontend application.

## License

This project is licensed under the MIT License.