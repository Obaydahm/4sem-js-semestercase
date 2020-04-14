/*
a) Create a simple middleware, which for ALL incoming API-request will log (console.log in this first version) the following details:
Time, The method (GET, PUT, POST or DELETE), the URL

b) Move your logger-middleware into the folder middlewares, in a file simpleLogger.ts, and export it from here. Import and use it in app.ts.
*/
export default function simpleLogger(req: any, res: any, next: any) {
    console.log(new Date(), req.method, req.hostname)
    next()
}
