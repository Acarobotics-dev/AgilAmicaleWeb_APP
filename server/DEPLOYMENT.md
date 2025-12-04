# Deployment Requirements

## Node.js Version

This application requires **Node.js 18.0.0 or higher**.

The application uses the global `fetch` API for hCaptcha verification, which is only available natively in Node.js 18+.

### Verifying Your Node.js Version

```bash
node --version
```

### Installing Node.js 18+

If you need to upgrade Node.js:

- **Using nvm (recommended)**:
  ```bash
  nvm install 18
  nvm use 18
  ```

- **Direct download**: Visit [nodejs.org](https://nodejs.org/) and download the LTS version (18+)

## Environment Variables

Ensure all required environment variables are set in `.env`:

### Required for all environments:
- `MONGO_URI` - MongoDB connection string
- `CLIENT_URI` - Comma-separated list of allowed frontend origins
- `SESSION_SECRET` - Secret for session encryption
- `JWT_SECRET` - Secret for JWT token signing

### Required for production:
- `EMAIL_HOST` - SMTP server hostname
- `EMAIL_PORT` - SMTP server port (typically 465 or 587)
- `EMAIL_USER` - Email account username
- `EMAIL_PASS` - Email account password

### Optional:
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment mode (development/production)
- `HCAPTCHA_SECRET` - hCaptcha secret key
- `HCAPTCHA_SITEKEY` - hCaptcha site key

## Installation

```bash
npm install
```

## Running the Application

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```
