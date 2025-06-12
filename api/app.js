var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");
// Import socket.io for WebSocket support
const socketIo = require("socket.io");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

// Allow requests from http://localhost:3001
app.use(
  cors({
    origin: "http://localhost:3001",
    credentials: true, // if you need cookies or Authorization headers
  })
);
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

// Export app for HTTP server creation
module.exports = app;

// Set up Socket.IO with the HTTP server
app.setupSocketIO = function (server) {
  // Create Socket.IO instance, allowing CORS from client
  const io = socketIo(server, {
    cors: {
      origin: "http://localhost:3001",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Store connected clients
  const connectedClients = new Set();

  // WebSocket connection handler
  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);
    connectedClients.add(socket.id);

    // Send welcome notification to the new client
    socket.emit("notification", {
      message: "Welcome to the notification service!",
      timestamp: new Date().toISOString(),
    });

    // Broadcast to all clients that a new user has connected
    socket.broadcast.emit("notification", {
      message: `New user ${socket.id} has joined`,
      timestamp: new Date().toISOString(),
    });

    // Listen for new notifications from clients
    socket.on("send-notification", (data) => {
      // Broadcast the notification to all other clients
      socket.broadcast.emit("notification", {
        message: data.message,
        sender: socket.id,
        timestamp: new Date().toISOString(),
      });
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
      connectedClients.delete(socket.id);

      // Notify remaining clients about disconnection
      io.emit("notification", {
        message: `User ${socket.id} has left`,
        timestamp: new Date().toISOString(),
      });
    });
  });

  // Create API endpoint to send notification to all clients
  app.post("/api/notify", (req, res) => {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Broadcast message to all connected clients
    io.emit("notification", {
      message,
      timestamp: new Date().toISOString(),
      isSystem: true,
    });

    res.json({
      success: true,
      clientCount: connectedClients.size,
    });
  });

  return io;
};
