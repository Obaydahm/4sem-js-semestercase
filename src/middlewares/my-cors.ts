//c) In the middlewares folder create a new file, my-cors.ts and add and export a middleware function that can add required CORS-headers.
export default function myCors(res: any, req: any, next: any) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
}