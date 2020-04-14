import express from "express";
import userFacade from "../facades/userFacade";
const router = express.Router();
import authMiddleware from "../middlewares/basic-auth";
import { ApiError } from "../errors/apiError";

router.post('/', async (req: any, res, next) => {
    try {
        let newUser = req.body;
        newUser.role = "user";  //Even if a hacker tried to "sneak" in his own role, this is what you get
        const status = await userFacade.addUser(newUser)
        res.json({ status })
    } catch (err) {
        next(err);
    }
})

router.use(authMiddleware)

router.get('/me', async function (req: any, res, next) {
    try {
        const user = await userFacade.getUser(req.username);
        const { name, username } = user;
        const userDTO = { name, username }
        res.json(userDTO);
    } catch (err) {
        next(err)
    }
});

router.get('/', async function (req: any, res, next) {
    try {
        const role = req.role;
        if (role != "admin") throw new ApiError("Not Authorized", 403);
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
        const role = req.role;
        if (role != "admin") throw new ApiError("Not Authorized", 403);
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
        const role = req.role;
        if (role != "admin") throw new ApiError("Not Authorized", 403);
        const username = req.params.username;
        const status = await userFacade.deleteUser(username)
        res.json({ status })
    } catch (err) {
        next(err);
    }
})

module.exports = router;
