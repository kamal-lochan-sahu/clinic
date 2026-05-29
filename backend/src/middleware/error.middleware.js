import ApiError from "../utils/ApiError.js";

const errorHandler = (err, req, res, next) => {
  let error = err;
  if (!(error instanceof ApiError)) {
    error = new ApiError(error.statusCode || 500, error.message || "Internal Server Error", error?.errors || [], err.stack);
  }
  return res.status(error.statusCode).json({
    success: false,
    message: error.message,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
};

export default errorHandler;
