# Modern Tailors Management System

## Project

A production-grade order management system for Modern Tailors.

Current technology stack:

- React
- Node.js
- Express
- MongoDB Atlas
- Cloudinary (planned)
- JWT Authentication (planned)

---

## Business Workflow

Only Admin logs into the system.

Admin creates customer orders.

One order may contain multiple garments.

Example:

Order #9001

- Shirt
- Pant
- Blazer

Each garment has:

- itemNumber
- garmentType
- quantity
- unitPrice
- subtotal
- measurements
- fabricImageUrl
- note
- isUrgent
- status
- isCuttingCompleted

Customer information belongs to the order.

Payment belongs to the order.

Payments are stored as transaction history.

---

## Current Database

Order Schema Version 2

Features completed:

- Multi-garment orders
- Public Invoice ID
- Dynamic measurements
- Transaction history
- Automatic order numbering
- Automatic cutting date
- Automatic subtotal calculation
- Automatic total calculation

---

## Remaining Backend

- Rewrite updateOrder()
- Rewrite completeCutting()
- Rewrite getTodayCuttings()
- Rewrite completePayment()
- Dashboard API

---

## Future Features

- JWT Login
- React Dashboard
- Customer Invoice
- Cutting Slip
- Cloudinary Upload
- Analytics