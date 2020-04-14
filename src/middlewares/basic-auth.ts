var http = require('http')
var auth = require('basic-auth')
var compare = require('tsscmp')
import { Response } from "express"
//import userFacade from '../facades/userFacade';
import userFacade from '../facades/userFacadeWithDB';

// Create server
var authMiddleware = async function (req: any, res: Response, next: Function) {
    var credentials = auth(req)
    console.log(userFacade.getAllUsers())
    try {
        if (credentials && await userFacade.checkUser(credentials.name, credentials.pass)) {
            const user = await userFacade.getUser(credentials.name)
            req.username = user.username;
            req.role = user.role;
            return next();
        }
    } catch (err) { }
    res.statusCode = 401
    res.setHeader('WWW-Authenticate', 'Basic realm="example"')
    res.end('Access denied')
}
export default authMiddleware