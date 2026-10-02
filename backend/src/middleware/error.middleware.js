const isProd = () => process.env.NODE_ENV === "production";

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || "Internal Server Error";

  if (err.name === "ValidationError" && err.errors) {
    statusCode = 400;
    message = Object.values(err.errors).map((e) => e.message).join(", ");
  } else if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid value for " + err.path;
  } else if (err.code === 11000) {
    statusCode = 409;
    message = "Duplicate value for " + Object.keys(err.keyPattern || {}).join(", ");
  } else if (err.type === "entity.parse.failed") {
    statusCode = 400;
    message = "Invalid JSON body";
  } else if (message === "Not allowed by CORS") {
    statusCode = 403;
  }

  if (statusCode >= 500) {
    console.error(err);
    if (isProd()) message = "Internal Server Error";
  }

  return res.status(statusCode).json({
    success: false,
    message,
    ...(!isProd() && statusCode >= 500 && { stack: err.stack }),
  });
};

export default errorHandler;
