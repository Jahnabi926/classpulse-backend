const { Server } = require("socket.io");
const socketAuth = require("./socketAuth");
const Class = require("../models/class");

const activeQuestions = {}; // { classId: { question, options, answers: {} } }, activeQuestions lives only in your server's memory unless stored in mongodb or redis in a production version. if the server restarts, it's gone.
const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "https://classpulse-frontend-three.vercel.app",
      credentials: true, // required so the cookie is sent during the handshake
    },
  });
  io.use(socketAuth); // io.use(socketAuth) registers socketAuth as middleware that must run and complete before the "connection" event is allowed to fire.

  io.on("connection", (socket) => {
    console.log(socket.user);
    console.log(`Authenticated socket for ${socket.user.firstName}`);

    // event handlers go here — join-class-room first
    // ---------- Event handlers — listeners registered immediately, no async gap ----------
    // JOIN CLASS
    socket.on("joinClass", async ({ classId }) => {
      // { classId } is the payload
      try {
        const userId = socket.user._id; // trusted, not from payload
        const grade = await Class.findById(classId);
        if (!grade) {
          throw new Error("Class not found");
        }
        const isTeacher = grade.teacherId.equals(userId);
        const isStudent = grade.students.some((id) => id.equals(userId));
        if (!isTeacher && !isStudent) {
          throw new Error("You don't belong to the class");
        }
        socket.join(classId);
        console.log(`Joined class with classId ${classId}`);
      } catch (error) {
        socket.emit("error", { message: error.message });
      }
    });
    // START QUESTION (Teacher Only)
    socket.on("start-question", async ({ classId, question, options }) => {
      try {
        const userId = socket.user._id;
        const grade = await Class.findById(classId);
        if (!grade) {
          throw new Error("Class not found");
        }

        const isTeacher =
          socket.user.role === "teacher" && grade.teacherId.equals(userId);
        if (!isTeacher) {
          throw new Error("Unauthorized: Only teachers can start a quiz");
        }
        activeQuestions[classId] = { question, options, answers: {} };
        io.to(classId).emit("new-question", { question, options });
      } catch (error) {
        socket.emit("error", { message: error.message });
      }
    });
    // SUBMIT ANSWER (Student Only)
    socket.on("submit-answer", async ({ classId, answer }) => {
      try {
        const { _id, firstName, role } = socket.user;
        const grade = await Class.findById(classId);
        if (!grade) {
          throw new Error("Class not found");
        }

        const isStudent =
          role === "student" && grade.students.some((id) => id.equals(_id));
        if (!isStudent) {
          throw new Error("You must be a student to submit the answer");
        }
        // Verify quiz is live
        if (!activeQuestions[classId]) {
          throw new Error("No active questions for this class");
        }
        if (_id in activeQuestions[classId].answers) {
          throw new Error("You already answered this question");
        }
        activeQuestions[classId].answers[_id] = answer;
        /**
        activeQuestions = {
    "6a8b...": {
    question: "What is 2+2?",
    options: ["3", "4", "5"],
    answers: {
      "6a8e...": "4"   // Manash's ID → his answer
      "9f2c...": "5"    // Priya's ID → her answer
    }
  }
} 
  Object.keys(...) returns an array of just the keys (["6a8e...", "9f2c..."]), 
  and .length gives you the count (2).*/
        io.to(classId).emit("answers-received", {
          firstName,
          totalAnswers: Object.keys(activeQuestions[classId].answers).length,
        });
      } catch (error) {
        socket.emit("error", { message: error.message });
      }
    });
    // END QUESTION & CLEANUP
    socket.on("end-question", async ({ classId }) => {
      try {
        const { _id, role } = socket.user;
        const grade = await Class.findById(classId);
        if (!grade) {
          throw new Error("Class not found");
        }
        const isTeacher = role === "teacher" && grade.teacherId.equals(_id);
        if (!isTeacher) {
          throw new Error("Only a teacher can clear the questions");
        }
        if (activeQuestions[classId]) {
          const finalAnswers = activeQuestions[classId].answers;
          io.to(classId).emit("quiz-results", finalAnswers);
          delete activeQuestions[classId]; // Free up server memory
        }
      } catch (error) {
        socket.emit("error", { message: error.message });
      }
    });
    socket.on("disconnect", () => {
      console.log(`${socket.user.firstName} disconnected`);
    });
  });
};

module.exports = initializeSocket;
