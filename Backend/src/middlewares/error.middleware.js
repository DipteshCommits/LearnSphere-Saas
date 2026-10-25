export default (err,req,res,next)=>{
    console.error(err);

    const statusCode = Number.isInteger(err.statusCode) ? err.statusCode : 500;

    res.status(statusCode).json({
        message: statusCode === 500 ? "Internal Server Error" : err.message
    });
};