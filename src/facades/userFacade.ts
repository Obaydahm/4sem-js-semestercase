const Joi = require('@hapi/joi');
const bcrypt = require('bcryptjs');
import { bryptAsync, bryptCheckAsync } from "../utils/bcrypt-async-helper"
const debug = require("debug")("game-case")
import { ApiError } from "../errors/apiError"
import IGameUser from '../interfaces/GameUser';

function dummyReturnPromise<T>(val: T | null, err: string = "Unknown Error", code: number = 500): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        setTimeout(() => {
            if (!val) { reject(new ApiError(err, code)) }
            else resolve(val);
        }, 0);
    })
}

export default class UserFacade {
    public static users: Array<IGameUser> = [
        {
            name: 'Mo',
            username: 'mo@b.dk',
            password: '$2a$10$n4c9MRlbrNx3sieqxLcwMuv2mCzpcF7zZMY51RyiuS5K7mjO8tyjS', //123
            role: 'admin'
        },
        {
            name: 'Bill',
            username: 'b@b.dk',
            password: '$2a$10$n4c9MRlbrNx3sieqxLcwMuv2mCzpcF7zZMY51RyiuS5K7mjO8tyjS',
            role: 'user'
        },
        {
            name: 'Tim',
            username: 'tim@b.dk',
            password: '$2a$10$n4c9MRlbrNx3sieqxLcwMuv2mCzpcF7zZMY51RyiuS5K7mjO8tyjS',
            role: 'user'
        }
    ];

    static async addUser(user: IGameUser): Promise<string> {
        //const { error } = this.validateUser(user);
        //const userExists = this.users.find(u => u.username === user.username);

        const hash = await bryptAsync(user.password);
        let newUser = { ...user, password: hash }
        UserFacade.users.push(newUser);
        debug(newUser.password)
        return dummyReturnPromise<string>("User was added");
    }

    static async deleteUser(username: string): Promise<string> {
        const newArray = UserFacade.users.filter(u => u.username != username);
        UserFacade.users = [...newArray];
        return dummyReturnPromise<string>("User was deleted");
    }

    static async getAllUsers(): Promise<Array<IGameUser>> {
        return dummyReturnPromise<Array<IGameUser>>(UserFacade.users);
    }

    static async getUser(username: string): Promise<IGameUser> {
        let user: IGameUser | undefined
        user = UserFacade.users.find(u => u.username === username)
        if (user) {
            return dummyReturnPromise<IGameUser>(user);
        }
        return dummyReturnPromise<IGameUser>(null, "User Not Found", 404);
    }

    static async checkUser(username: string, password: string): Promise<boolean> {
        try {
            let user: IGameUser | undefined;
            user = await UserFacade.getUser(username);
            return bryptCheckAsync(password, user.password);
        } catch (err) {
            return dummyReturnPromise<boolean>(false);
        }
    }

    private static validateUser(user: IGameUser) {
        const schema = Joi.object({
            name: Joi.string().min(3).required(),
            username: Joi.string().email().required(),
            password: Joi.string().required(),
            role: Joi.string().min(3).required()
        })
        return schema.validate(user);
    }
}

async function test() {
    console.log("testing")
    await UserFacade.addUser({ name: "kim", username: "kim@b.dk", password: "secret", role: "user" })
    await UserFacade.addUser({ name: "ole", username: "ole@b.dk", password: "secret", role: "user" })
    const all = await (await UserFacade.getAllUsers()).length;
    debug("users", all);
    const peter = await UserFacade.getUser("kim@b.dk");
    debug("Found Kim", peter.username)
    await UserFacade.deleteUser("ole@b.dk");
    try {
        const donald = await UserFacade.getUser("ole@b.dk")
    } catch (err) {
        debug("Could not find ole", err)
    }
    try {
        const ok = await UserFacade.checkUser("kim@b.dk", "secret");
        debug("Password and user was OK", ok)
        await UserFacade.checkUser("pp@b.dk", "wrong password");
        debug("I should not get here")
    } catch (err) {
        debug("Password did not match")
    }

}
//test();
