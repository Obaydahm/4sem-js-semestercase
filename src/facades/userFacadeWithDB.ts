const path = require('path')
require('dotenv').config({ path: path.join(process.cwd(), '.env') })
import IGameUser from '../interfaces/GameUser';
import { bryptAsync, bryptCheckAsync } from "../utils/bcrypt-async-helper"
import * as mongo from "mongodb"
import setup from "../config/setupDB"
import { ApiError } from "../errors/apiError"

let userCollection: mongo.Collection;

export default class UserFacade {

    static async setDatabase(client: mongo.MongoClient) {
        const dbName = process.env.DB_NAME;

        if (!dbName) {
            throw new Error("Database name not provided")
        }
        try {
            if (!client.isConnected()) {
                await client.connect();
            }
            userCollection = client.db(dbName).collection("users");
            await userCollection.createIndex({ username: 1 }, { unique: true })
            return client.db(dbName);

        } catch (err) {
            console.error("Could not create connect", err)
        }
    }

    static async addUser(user: IGameUser): Promise<string> {
        const hash = await bryptAsync(user.password);
        let newUser = { ...user, password: hash }
        const result = await userCollection.insertOne(newUser);
        return "User was added";
    }
    static async deleteUser(username: string): Promise<string> {
        const userToDelete = await userCollection.findOneAndDelete({ username });
        if (userToDelete.value === null) throw new ApiError("User was not deleted", 400);
        return "User was removed";
    }
    //static async getAllUsers(): Promise<Array<IGameUser>> {
    static async getAllUsers(): Promise<Array<any>> {
        return await userCollection.find(
            {},
            { projection: { _id: 0, name: 1, username: 1 } }
        ).toArray();
    }

    static async getUser(username: string, proj?: object): Promise<any> {
        const user = await userCollection.findOne({ username }, proj);
        if (!user) throw new ApiError("User not found", 400);
        return user;
    }

    static async checkUser(username: string, password: string): Promise<boolean> {
        let userPassword = "";
        try {
            const user = await UserFacade.getUser(username);
            userPassword = user.password;
        } catch (err) { }

        const status = await bryptCheckAsync(password, userPassword);
        return status
    }
}

async function test() {
    console.log("testing")
    const client = await setup();
    await UserFacade.setDatabase(client)
    await userCollection.deleteMany({})
    await UserFacade.addUser({ name: "kim", username: "kim@b.dk", password: "secret", role: "user" })
    await UserFacade.addUser({ name: "ole", username: "ole@b.dk", password: "secret", role: "user" })

    const all = await UserFacade.getAllUsers();
    console.log(all);

    const projection = { projection: { _id: 0, role: 0, password: 0 } }
    const kim = await UserFacade.getUser("kim@b.dk", projection)
    console.log(kim)

    // try {
    //     let status = await UserFacade.deleteUser("kim@b.dk");
    //     console.log(status)
    //     status = await UserFacade.deleteUser("xxxx@b.dk");
    //     console.log("Should not get here")
    // } catch (err) {
    //     console.log(err.message)
    // } finally {
    //     console.log(await UserFacade.getAllUsers());
    // }

    /*try {
        const passwordStatus = await UserFacade.checkUser("kim@b.dk", "secret");
        console.log("Expects true: ", passwordStatus)
    } catch (err) {
        console.log("Should not get here 1", err)
    }
    try {
        const passwordStatus = await UserFacade.checkUser("kim@b.dk", "xxxx");
        console.log("Should not get here ", passwordStatus)
    } catch (err) {
        console.log("Should get here with failded 2", err)
    }
    try {
        const passwordStatus = await UserFacade.checkUser("xxxx@b.dk", "secret");
        console.log("Should not get here")
    } catch (err) {
        console.log("should get here with failded 2", err)
    }

    client.close();
    */
    //console.log("DBNAME", process.env.DB_NAME)
    //console.log(await UserFacade.getUser("t1"))
}
//test();
