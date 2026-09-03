const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

// ---------- LAYER 1: AUTH (runs and fully completes BEFORE "connection" fires) ----------

const socketAuth = async (socket, next) => {
  try {
    // socket.handshake.headers.cookie — a raw string, nothing has parsed it yet
    const cookies = cookie.parseCookie(socket.handshake.headers.cookie || ""); // — manually converts the raw string into { token: "..." }
    const { token } = cookies;

    if (!token) {
      return next(new Error("No token provided")); // next(new Error(...)) — sockets don't have res, so rejection happens by calling next() with an error instead
    }
    // await only matters when a function returns a Promise that resolves later — jwt.verify() (no-callback version) never does that.
    const decodedObj = jwt.verify(token, process.env.JWT_SECRET); // decodedObj is literally just { _id: "6a855...", iat: ..., exp: ... } (the iat/exp are timestamp metadata jwt adds automatically) — no firstName, no email, nothing else.
    const { _id } = decodedObj;

    const loggedInUser = await User.findById(_id);
    if (!loggedInUser) {
      return next(new Error("User not found"));
    }
    socket.user = loggedInUser; // trusted identity, guaranteed ready by the time "connection" fires
    next(); // Calling next() (with no argument) is the signal "this middleware passed, let the connection proceed." Only after next() runs does Socket.io move forward and actually trigger io.on("connection", (socket) => {...}) — so by the time that callback runs, socket.user is guaranteed to already exist.
  } catch (error) {
    next(error); // next(error) = "reject and stop here." Passing an Error object into next() tells Socket.io "reject this connection entirely."
  }
};

module.exports = socketAuth;
