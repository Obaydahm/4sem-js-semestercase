const path = require('path')
require('dotenv').config({ path: path.join(process.cwd(), '.env') })
import IPoint from '../interfaces/Point';
import * as mongo from "mongodb"
import { ApiError } from "../errors/apiError"
import setup from "../config/setupDB"
import userFacade from "./userFacadeWithDB"
import IPosition from '../interfaces/Position';
import IPost from '../interfaces/Post';
import { positionCreator } from "../utils/geoUtils"
import { POSITION_COLLECTION_NAME, POST_COLLECTION_NAME } from "../config/collectionNames"

let positionCollection: mongo.Collection;
let postCollection: mongo.Collection;
const EXPIRES_AFTER = 30;

export default class GameFacade {

    static readonly DIST_TO_CENTER = 15

    static async setDatabase(client: mongo.MongoClient) {
        const dbName = process.env.DB_NAME;
        if (!dbName) {
            throw new Error("Database name not provided")
        }
        //This facade uses the UserFacade, so set it up with the right client
        await userFacade.setDatabase(client);

        try {
            if (!client.isConnected()) {
                await client.connect();
            }
            positionCollection = client.db(dbName).collection(POSITION_COLLECTION_NAME);

            //TODO
            //1) Create expiresAfterSeconds index on lastUpdated
            await positionCollection.createIndex({ "lastUpdated": 1 }, { expireAfterSeconds: 30 })
            //2) Create 2dsphere index on location
            await positionCollection.createIndex({ location: "2dsphere" })


            //TODO uncomment if you plan to do this part of the exercise
            //postCollection = client.db(dbName).collection(POST_COLLECTION_NAME);
            //TODO If you do this part, create 2dsphere index on location
            //await postCollection.createIndex({ location: "2dsphere" })
            return client.db(dbName);

        } catch (err) {
            console.error("Could not connect", err)
        }
    }

    static async nearbyPlayers(username: string, password: string, longitude: number, latitude: number, distance: number) {
        let user;
        try {
            //Step-1. Find the user, and if found continue
            user = await userFacade.getUser(username);
            await userFacade.checkUser(username, password);
        } catch (err) {
            throw new ApiError("wrong username or password", 403); // 
        }

        try {
            //If loggedin update (or create if this is the first login) his position

            const point = { type: "Point", coordinates: [longitude, latitude] };
            const date = new Date();

            const found = await positionCollection.findOneAndUpdate(
                { username },
                {
                    $set: {
                        username,
                        name: user.name,
                        location: point,
                        lastUpdated: date
                    }
                },
                { upsert: true, returnOriginal: false }
                /*
                    upsert:true - hvis dokumentet ikke findes i databasen, så laves der et
                    returnOriginal:false - sæt til false så den returner dokumenter, da default return er null
                */
            )


            /* TODO 
               By know we have updated (or created) the callers position-document
               Next step is to see if we can find any nearby players, friends or whatever you call them
               */
            const nearbyPlayers = await GameFacade.findNearbyPlayers(username, point, distance);

            //If anyone found,  format acording to requirements
            const formatted = nearbyPlayers.map((player) => {
                return {
                    username: player.username,
                    name: player.name,
                    lon: player.location.coordinates[0],
                    lat: player.location.coordinates[1]
                    // Complete this, using the requirements
                }
            })
            return formatted
        } catch (err) {
            throw err;
        }
    }
    static async findNearbyPlayers(clientUsername: string, point: IPoint, distance: number): Promise<Array<IPosition>> {
        try {
            const found = await positionCollection.find(
                { // "querien"
                    username: { $ne: clientUsername }, // $ne = not equal, altså vi hellere ikke henter vores egen bruger
                    location:
                    {
                        $near:
                        {
                            $geometry: {
                                type: "Point",
                                coordinates: [point.coordinates[0], point.coordinates[1]]
                            },
                            $maxDistance: distance
                        }
                    }
                }
            )
            return found.toArray();
        } catch (err) {
            throw err;
        }
    }

    static async getPostIfReached(postId: string, lat: number, lon: number): Promise<any> {
        try {
            const post: IPost | null = await postCollection.findOne(
                {
                    _id: postId,
                    location:
                    {
                        $near: {}
                        // Todo: Complete this
                    }
                }
            )
            if (post === null) {
                throw new ApiError("Post not reached", 400);
            }
            return { postId: post._id, task: post.task.text, isUrl: post.task.isUrl };
        } catch (err) {
            throw err;
        }

    }

    //You can use this if you like, to add new post's via the facade
    static async addPost(
        name: string,
        taskTxt: string,
        isURL: boolean,
        taskSolution: string,
        lon: number,
        lat: number
    ): Promise<IPost> {
        const position = { type: "Point", coordinates: [lon, lat] };
        const status = await postCollection.insertOne({
            _id: name,
            task: { text: taskTxt, isURL },
            taskSolution,
            location: {
                type: "Point",
                coordinates: [lon, lat]
            }
        });
        const newPost: any = status.ops;
        return newPost as IPost
    }
}

async function test() {
    const client = await setup();
    GameFacade.setDatabase(client);
    const nearby = await GameFacade.nearbyPlayers("t1", "secret", 12.48, 55.77, 1999);
}

//test()