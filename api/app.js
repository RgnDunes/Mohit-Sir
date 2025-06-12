var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");

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

// Mock data for dashboard
const mockData = Array.from({ length: 100 }, (_, index) => ({
  id: index + 1,
  name: `Item ${index + 1}`,
  category: ["Electronics", "Clothing", "Books", "Food", "Toys"][
    Math.floor(Math.random() * 5)
  ],
  price: Math.floor(Math.random() * 1000) + 10,
  stock: Math.floor(Math.random() * 100),
  rating: (Math.random() * 5).toFixed(1),
  date: new Date(Date.now() - Math.floor(Math.random() * 10000000000))
    .toISOString()
    .split("T")[0],
}));

// API endpoint for dashboard data with pagination, filtering and sorting
app.get("/api/dashboard", function (req, res) {
  // Get query parameters
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const sortBy = req.query.sortBy || "id";
  const sortOrder = req.query.sortOrder || "asc";
  const filterCategory = req.query.category;
  const minPrice = req.query.minPrice ? parseInt(req.query.minPrice) : 0;
  const maxPrice = req.query.maxPrice ? parseInt(req.query.maxPrice) : Infinity;

  // Filter data
  let filteredData = [...mockData];

  if (filterCategory) {
    filteredData = filteredData.filter(
      (item) => item.category === filterCategory
    );
  }

  // Apply price filter
  filteredData = filteredData.filter(
    (item) => item.price >= minPrice && item.price <= maxPrice
  );

  // Sort data
  filteredData.sort((a, b) => {
    if (sortOrder === "asc") {
      return a[sortBy] > b[sortBy] ? 1 : -1;
    } else {
      return a[sortBy] < b[sortBy] ? 1 : -1;
    }
  });

  // Calculate pagination
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Prepare response
  const response = {
    data: paginatedData,
    pagination: {
      totalItems: filteredData.length,
      totalPages: Math.ceil(filteredData.length / limit),
      currentPage: page,
      itemsPerPage: limit,
    },
    filters: {
      categories: [...new Set(mockData.map((item) => item.category))],
      priceRange: {
        min: Math.min(...mockData.map((item) => item.price)),
        max: Math.max(...mockData.map((item) => item.price)),
      },
    },
  };

  res.json(response);
});

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

module.exports = app;
