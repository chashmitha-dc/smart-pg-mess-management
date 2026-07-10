# Smart Mess Management System - Master Project Specification

> Version: 1.0 Purpose: Production-ready Smart Mess Management System
> for commercial deployment.

# Vision

Build a production-ready **Smart Mess Management System** that can be
sold to PG/Mess owners. The system consists of:

-   Admin Portal (React + Material UI)
-   Member Portal (React + Material UI)
-   Flask REST API Backend
-   PostgreSQL Database
-   AI Food Prediction Module
-   JWT Authentication
-   Responsive UI
-   Deployment-ready architecture

------------------------------------------------------------------------

# Core Modules

## Admin Portal

-   Login
-   Dashboard
-   Mess Details
-   Members
-   Meal Plans
-   Meal Prices
-   Leave Management
-   Billing
-   Payments
-   Complaints
-   Notifications
-   AI Prediction
-   Reports
-   Settings
-   Profile

## Member Portal

-   Login
-   Dashboard
-   Profile
-   Meal Plan
-   Today's Menu
-   Leave Requests
-   Bills
-   Payment History
-   Complaints
-   Notifications
-   Change Password

------------------------------------------------------------------------

# Tech Stack

Frontend: - React - Vite - Material UI - React Router - Axios - React
Hot Toast - Recharts

Backend: - Flask - SQLAlchemy - Flask-JWT-Extended - Flask-CORS

Database: - PostgreSQL

AI: - Pandas - Scikit-learn - Joblib

Deployment: - Frontend: Vercel - Backend: Render or Railway - Database:
Neon PostgreSQL

------------------------------------------------------------------------

# Database

Tables:

-   Owner
-   PG (Mess Details)
-   Member
-   MealPlan
-   MealPrice
-   AbsenceRequest
-   Bill
-   Payment
-   Complaint
-   Notification
-   FoodPrediction

Add production fields:

Member: - password - profile_image - last_login

Owner: - profile_photo

Notification: - recipient_type - read_status

ActivityLog

------------------------------------------------------------------------

# Authentication

Owner: Email + Password

Member: Phone + Password

JWT Roles: - owner - member

------------------------------------------------------------------------

# Dashboard

Cards: - Total Members - Revenue - Pending Bills - Open Complaints

Charts: - Monthly Revenue - Complaint Trend - Payment Trend

AI Card: - Breakfast Prediction - Lunch Prediction - Dinner Prediction

------------------------------------------------------------------------

# Member Workflow

Owner creates meal plans

↓

Owner sets meal prices

↓

Owner adds members

↓

Member logs in

↓

Requests leave

↓

Owner approves/rejects

↓

Generate bill

↓

Member pays

↓

Owner verifies payment

↓

Dashboard updates

↓

AI predicts tomorrow's meals

------------------------------------------------------------------------

# AI Module

Predict: - Breakfast - Lunch - Dinner

Features: - Active Members - Meal Plans - Approved Leave

Store: - Prediction History - Accuracy

Generate recommendations.

------------------------------------------------------------------------

# UI Requirements

-   Professional SaaS dashboard
-   Responsive
-   Dark mode
-   Search
-   Filters
-   Pagination
-   Toast notifications
-   Loading skeletons
-   Validation
-   Confirmation dialogs

------------------------------------------------------------------------

# React Folder Structure

src/ - api/ - components/ - common/ - members/ - mealplans/ - billing/ -
payments/ - complaints/ - pages/ - Dashboard/ - Members/ - MealPlans/ -
MealPrice/ - Billing/ - Payments/ - Complaints/ - Notifications/ - AI/ -
layouts/ - hooks/ - context/ - styles/

------------------------------------------------------------------------

# Backend Structure

backend/ - app.py - config/ - models/ - routes/ - services/ - ml/ -
utils/

Architecture:

React ↓ Axios ↓ Flask Routes ↓ Services ↓ Models ↓ PostgreSQL

------------------------------------------------------------------------

# Coding Standards

-   Modular architecture
-   Service layer
-   No business logic inside routes
-   Reusable React components
-   Consistent API responses
-   JWT protected endpoints
-   Proper validation
-   Error handling
-   Logging

------------------------------------------------------------------------

# Deployment Checklist

-   Environment variables
-   Production database
-   HTTPS
-   CORS configuration
-   Build frontend
-   Deploy backend
-   Configure domain
-   Test authentication
-   Test CRUD
-   Test AI
-   Backup database

------------------------------------------------------------------------

# Goal

Deliver a commercial-grade Smart Mess Management System suitable for
real PG/Mess owners with both Admin and Member portals, production-ready
architecture, clean UI, AI-assisted meal prediction, secure
authentication, and deployment-ready code.
