# Sports Venue Booking Platform

### DRIVE VIDEO LINK : https://drive.google.com/drive/folders/1K9HuTbBM0QSi2E6WdFwWrx9C-8IlkXAq?usp=sharing 
### YT VIDEO LINK : https://youtu.be/G03klEB_giI

## 🏟️ External API'S

- **Cloudinary API** 
- **OAuth API**
- **MAPBOX API**
- **OpenWeather API**
- **Google Translate API**
- **Razor Pay API**
- 

A comprehensive sports venue booking platform that connects sports enthusiasts with facility owners, enabling seamless venue discovery, booking, and management.

## 🏟️ Overview

This platform allows users to find and book sports venues across different locations, while providing facility owners with tools to manage their venues, courts, and bookings. The application supports various sports including badminton, tennis, football, basketball, cricket, volleyball, and table tennis.

## 🛠️ Technology Stack

### Backend
- **Node.js** with **Express.js** - Server framework
- **MongoDB** with **Mongoose** - Database and ODM
- **Socket.io** - Real-time communication for chat features
- **JWT** - Authentication and authorization
- **Bcryptjs** - Password hashing
- **Cloudinary** - Image storage and management
- **Nodemailer** - Email notifications
- **Razorpay** - Payment processing
- **Mapbox SDK** - Location services
- **Node-cron** - Scheduled tasks for booking cleanup

### Frontend
- **React** with **Vite** - Frontend framework and build tool
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Styling framework
- **Framer Motion** - Animations
- **Mapbox GL** - Interactive maps
- **Axios** - HTTP client
- **Socket.io Client** - Real-time communication
- **React Hot Toast** - Notifications
- **Recharts** - Data visualization

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Git

### Environment Variables

Create `.env` files in both Frontend and Backend directories:

#### Backend `.env`
```env
# Database
MONGODB_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password

# Payment
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Mapbox
MAPBOX_ACCESS_TOKEN=your_mapbox_access_token

# Server
PORT=5000
NODE_ENV=development
```

#### Frontend `.env`
```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/NIKSH02/Odoo-Hackathon-Finals.git
   cd Odoo-Hackathon-Finals
   ```

2. **Install Backend Dependencies**
   ```bash
   cd Backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../Frontend
   npm install
   ```

4. **Start the Backend Server**
   ```bash
   cd ../Backend
   npm run dev
   ```

5. **Start the Frontend Development Server**
   ```bash
   cd ../Frontend
   npm run dev
   ```

6. **Access the Application**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:8080`


## 🔧 Project Structure

```
├── Backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Route controllers
│   ├── middlewares/     # Custom middlewares
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   └── server.js        # Entry point
├── Frontend/
│   ├── public/          # Static assets
│   ├── src/
│   │   ├── api/         # API configuration
│   │   ├── components/  # Reusable components
│   │   ├── context/     # React context providers
│   │   ├── hooks/       # Custom hooks
│   │   ├── pages/       # Page components
│   │   ├── services/    # API service functions
│   │   └── utils/       # Utility functions
│   └── index.html       # Entry HTML file
```

## 🙏 Acknowledgments

- Built for the Odoo Hackathon Finals
- Uses various open-source libraries and APIs

