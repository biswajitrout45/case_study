const errorMiddleware = (error, req, res, next) => {
  console.error(error);

  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: error.message || "Something went wrong",
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
};

module.exports = errorMiddleware;
