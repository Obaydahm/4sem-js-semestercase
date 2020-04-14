import express from "express";
import userFacade from "../facades/userFacadeWithDB";
const router = express.Router();
import authMiddleware from "../middlewares/basic-auth";
import { ApiError } from "../errors/apiError";
//import * as mongo from "mongodb"
import setup from "../config/setupDB"
//const MongoClient = mongo.MongoClient;

const USE_AUTHENTICATION = false;

(async function setupDB() {
    const client = await setup()
    userFacade.setDatabase(client)
})()

router.post('/', async (req: any, res, next) => {
    try {
        let newUser = req.body;
        newUser.role = "user";
        const status = await userFacade.addUser(newUser)
        res.json({ status })
    } catch (err) {
        next(err);
    }
})

if (USE_AUTHENTICATION) {
    router.use(authMiddleware)
}

if (USE_AUTHENTICATION) {
    router.get('/user/me', async function (req: any, res, next) {
        try {
            const user = await userFacade.getUser(req.username);
            const { name, username } = user;
            const userDTO = { name, username }
            res.json(userDTO);
        } catch (err) {
            next(err)
        }
    });
}
router.get('/', async function (req: any, res, next) {
    try {
        if (USE_AUTHENTICATION) {
            const role = req.role;
            if (role != "admin") throw new ApiError("Not Authorized", 403);
        }

        const users = await userFacade.getAllUsers();
        const usersDTO = users.map((user) => {
            const { name, username } = user;
            return { name, username }
        })
        res.json(usersDTO);
    } catch (err) {
        next(err)
    }
});

router.get("/:username", async (req: any, res, next) => {
    try {
        if (USE_AUTHENTICATION) {
            const role = req.role;
            if (role != "admin") throw new ApiError("Not Authorized", 403);
        }

        const user = await userFacade.getUser(req.params.username);
        const { name, username } = user;
        const userDTO = { name, username }
        res.json(userDTO);
    } catch (err) {
        next(err)
    }
})

router.delete('/:username', async function (req: any, res, next) {
    try {
        if (USE_AUTHENTICATION) {
            const role = req.role;
            if (role != "admin") throw new ApiError("Not Authorized", 403);
        }

        const username = req.params.username;
        const status = await userFacade.deleteUser(username)
        res.json({ status })
    } catch (err) {
        next(err);
    }
})

module.exports = router;
