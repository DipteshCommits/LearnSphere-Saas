export default (err,req,res,next)=>{
    console.error(err);

    const statusCode = err.code === "LIMIT_FILE_SIZE"
        ? 413
        : Number.isInteger(err.statusCode) ? err.statusCode : 500;

    res.status(statusCode).json({
        message: statusCode === 500
            ? "Internal Server Error"
            : statusCode === 413
                ? "Logo must be 2 MB or smaller."
                : err.message
    });
};