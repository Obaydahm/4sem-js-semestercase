export default function errorHandler(err: any, req: any, res: any, next: any) {
    if (err.name = "ApiError") {
        res.status(err.errorCode).send({ code: err.errorCode, msg: err.message });
        next(err);
    }
}
