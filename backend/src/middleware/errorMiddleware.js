const errorHandler = (err, req, res, next) => {
  console.error("ERROR:", err);

  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Une erreur interne est survenue."
  });
};

module.exports = errorHandler;