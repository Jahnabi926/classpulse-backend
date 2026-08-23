# ClassPulse

## About

An app for teachers and students to manage classroom engagement — teachers can mark attendance, run live quizzes, and post homework, while students can track their attendance, join live quizzes, and view assignments.

# ClassPulse — Backend

Express + MongoDB backend for ClassPulse, a classroom engagement app for teachers and students.

## Tech Stack

- Node.js, Express
- MongoDB, Mongoose
- Socket.io (real-time quiz)
- JWT & bcrypt (authentication)

## Folder Structure

backend/
├── config/ # database connection
├── models/ # Mongoose schemas
├── routes/ # Express route handlers
├── middlewares/ # auth middleware
├── utils/ # validation helpers
├── sockets/ # Socket.io event handlers
└── app.js # entry point

## Status

- [x] Project structure set up
- [x] Server connected to MongoDB Atlas (connects before accepting requests)
- [x] Authentication (signup/login)
- [ ] Class, Attendance, Homework APIs
- [ ] Live quiz via Socket.io

## Getting Started

```bash
npm install
# add a .env file with PORT, MONGODB_URI, JWT_SECRET
npm run dev
```
