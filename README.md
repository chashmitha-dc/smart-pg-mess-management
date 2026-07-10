# Smart Mess Management System

## Overview

Smart Mess Management System is a production-ready full-stack web application for managing a PG/Mess. It provides separate Admin and Member portals, AI-powered meal prediction, automated billing, payments, complaints, notifications, reports, and deployment-ready architecture.

## Tech Stack

### Frontend
- React
- Vite
- Material UI
- Axios
- React Router
- Recharts
- react-hot-toast

### Backend
- Flask
- SQLAlchemy (PostgreSQL)
- Flask-JWT-Extended
- Python-dotenv

### AI / Machine Learning
- Scikit-learn
- Pandas
- Joblib

---

## Getting Started

### Local Setup (Manual)

#### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment variables in a `.env` file (see `.env.example`).
5. Run database updates and migration checks:
   ```bash
   python utils/update_db.py
   ```
6. Run the Flask development server:
   ```bash
   python app.py
   ```

#### 2. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install package dependencies:
   ```bash
   npm install
   ```
3. Start the Vite local development server:
   ```bash
   npm run dev
   ```

---

### Docker Container Setup (Recommended)

To run the entire application orchestration stack including Postgres, Flask Backend, and React Frontend in Docker:

1. Ensure Docker Desktop is installed and running.
2. In the root project directory, run:
   ```bash
   docker-compose up --build
   ```
3. Once the build completes and containers start:
   - **Frontend App**: Accessible at `http://localhost`
   - **Backend API**: Accessible at `http://localhost:5000`

---

## Production Deployment Checklist

1. **Database Provisioning**: Set up a hosted PostgreSQL database (e.g. Neon, AWS RDS, Supabase).
2. **Environment Configuration**: Set strong production secrets:
   - `JWT_SECRET_KEY` (Strong cryptographic signature string)
   - `DATABASE_URL` (Point to your production PostgreSQL connection string)
3. **Frontend API URL**: Update `axiosInstance` base URL configuration inside `frontend/src/api/axios.js` to target the deployed backend endpoint.
4. **CORS Configuration**: Secure CORS origins inside `backend/app.py` to allow only the deployed frontend domain.
5. **Docker Deployments**: Use the provided `Dockerfile` and `docker-compose.yml` for automated staging and production setups in platforms like AWS, Render, Railway, or VPS instances.
