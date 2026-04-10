# AgilAmicaleWeb - Project Documentation

## Overview

AgilAmicaleWeb is a full-stack web application for managing an association (Amicale). It provides features for member management, bookings, events, conventions, and an admin dashboard for responsible users.

## Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS + shadcn-ui components
- **State Management**: React Context + TanStack Query
- **Form Handling**: React Hook Form + Zod
- **Routing**: React Router DOM 6
- **HTTP Client**: Axios
- **Charts**: Recharts

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT + Session-based auth
- **Security**: Helmet, CORS, bcryptjs, rate limiting
- **File Upload**: Multer
- **Email**: Nodemailer
- **SMS**: Twilio

## Project Structure

```
AgilAmicaleWeb_APP/
├── client/                    # React frontend
│   ├── src/
│   │   ├── api/              # Axios configuration
│   │   ├── components/       # UI components
│   │   │   ├── common/       # Shared components
│   │   │   ├── ui/           # shadcn-ui components
│   │   │   └── LandingComponents/
│   │   ├── config/           # App configuration
│   │   ├── context/          # React contexts
│   │   ├── hooks/            # Custom hooks
│   │   ├── lib/              # Utilities
│   │   └── pages/            # Page components
│   └── dist/                 # Production build
│
├── server/                    # Express backend
│   ├── controllers/          # Request handlers
│   │   ├── auth-controller/
│   │   └── responsible-controller/
│   ├── middleware/           # Express middleware
│   ├── models/               # Mongoose models
│   ├── routes/               # API routes
│   │   ├── auth-routes/
│   │   ├── responsible-routes/
│   │   └── contact-routes.js
│   ├── helpers/              # Utilities (email, sms, files)
│   └── server.js             # Entry point
│
└── uploads/                   # Uploaded files (gitignored)
```

## Features

### Authentication
- User registration with validation
- Login with email/matricule and password
- JWT-based authentication
- Password reset functionality
- Role-based access control (adherent, responsable)

### User Management
- Member registration and approval workflow
- Profile management
- User status tracking (En Attente, Approuvé, Refusé)

### Bookings
- **Houses**: Vacation house rentals
- **Hotels**: Hotel reservations
- Booking history tracking

### Events
- Event creation and management
- Event registration for members

### Conventions
- Convention document management
- Partnership agreements

### Dashboard (Responsible)
- User management (approve/reject)
- CRUD operations for houses, hotels, events, conventions
- Booking management
- Data visualization with charts

## API Endpoints

### Auth Routes (`/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register new user |
| POST | `/login` | User login |
| POST | `/logout` | User logout |
| GET | `/me` | Get current user |
| POST | `/forgot-password` | Request password reset |
| POST | `/reset-password/:token` | Reset password |

### Responsible Routes

| Resource | Methods | Description |
|----------|---------|-------------|
| `/responsible/house` | GET, POST, PUT, DELETE | House management |
| `/responsible/hotel` | GET, POST, PUT, DELETE | Hotel management |
| `/responsible/events` | GET, POST, PUT, DELETE | Event management |
| `/responsible/convention` | GET, POST, PUT, DELETE | Convention management |
| `/responsible/booking` | GET, PUT, DELETE | Booking management |

### Contact Routes (`/api/contact`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Submit contact form |

## Environment Variables

### Backend (.env)
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/agilamicale
SESSION_SECRET=your-session-secret
JWT_SECRET=your-jwt-secret
CLIENT_URI_1=http://localhost:5173
CLIENT_URI_2=http://localhost:3000
NODE_ENV=development

# Email (production only)
EMAIL_USER=your-email@gmail.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_PASS=your-email-password

# SMS (production only)
TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token
TWILIO_PHONE_NUMBER=your-number
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
VITE_API_TIMEOUT=10000
```

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup
```bash
cd server
npm install
# Create .env file with required variables
npm run dev
```

### Frontend Setup
```bash
cd client
npm install
npm run dev
```

### Build for Production
```bash
# Frontend
cd client
npm run build

# Backend
cd server
npm start
```

## User Roles

1. **Adherent** (Member): Standard user with access to booking, events, and profile
2. **Responsable** (Admin): Full access to management dashboard and all CRUD operations

## Workflow

1. User registers → Status: "En Attente" (Pending)
2. Responsable approves → Status: "Approuvé" (Approved)
3. User can access protected features after approval
4. If rejected → Status: "Refusé" (Rejected)

## License

ISC