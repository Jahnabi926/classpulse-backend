# ClassPulse

## About

An app for teachers and students to manage classroom engagement — teachers can create classes, mark attendance, and run live quizzes, while students can join classes via code and participate in live quizzes.

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
- [x] Server connected to MongoDB Atlas
- [x] Authentication (signup, login, logout, JWT middleware)
- [x] Classes (create, join by code, leave, view details with populated data)
- [x] Live quiz via Socket.io
- [ ] Attendance (stretch goal)

**Why Socket.io instead of regular HTTP routes(signup, login, class/create, etc.)?**:
HTTP is request/response — the client asks, the server answers once, done. If something changes later, the server has no way to tell the client; the client would have to ask again. Socket.io keeps one connection open in both directions, so the server can push updates the instant something happens, with no request needed. ClassPulse needs this for live quizzes: when a teacher starts a question, every student's screen must update at the same moment, without refreshing. That's only possible if the server can proactively push data — which plain HTTP can't do, but an open Socket.io connection can.

## API Endpoints

**Auth**

- `POST /signup` — create account (teacher or student)
- `POST /login`
- `POST /logout`
- `GET /profile/view` — protected

**Classes**

- `POST /class/create` — protected, teacher creates a class with a random join code
- `POST /class/join` — protected, student joins via join code
- `POST /class/leave` — protected
- `GET /class/:classId` — protected, only visible to the teacher or joined students

**Live Quiz (Socket.io events)**

- `joinClass` — client emits with `{ classId }`, puts the socket into that class's room
- `start-question` — teacher emits with `{ classId, question, options }`, broadcasts `new-question` to the room
- `submit-answer` — student emits with `{ classId, answer }`, broadcasts `answers-received` tally to the room
- `end-question` — teacher emits with `{ classId }`, broadcasts `quiz-results` and clears server state

## Getting Started

\`\`\`bash
npm install

# add a .env file with PORT, DB_CONNECTION_SECRET, JWT_SECRET

npm run dev
\`\`\`
