import path from "path";
require('dotenv').config({ path: path.join(process.cwd(), '.env') })
import * as mongo from "mongodb";
import { bryptAsync } from "./bcrypt-async-helper"
const MongoClient = mongo.MongoClient;
import { positionCreator } from "./geoUtils"
import { USER_COLLECTION_NAME, POSITION_COLLECTION_NAME, POST_COLLECTION_NAME } from "../config/collectionNames"

const uri = process.env.CONNECTION || ""

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

(async function makeTestData() {
  try {
    await client.connect();
    const db = client.db(process.env.DB_NAME)
    const usersCollection = db.collection(USER_COLLECTION_NAME)
    await usersCollection.deleteMany({})
    await usersCollection.createIndex({ username: 1 }, { unique: true })
    const secretHashed = await bryptAsync("secret");
    const team1 = { name: "Team1", username: "t1", password: secretHashed, role: "team" }
    const team2 = { name: "Team2", username: "t2", password: secretHashed, role: "team" }
    const team3 = { name: "Team3", username: "t3", password: secretHashed, role: "team" }

    const status = await usersCollection.insertMany([team1, team2, team3])

    const positionsCollection = db.collection(POSITION_COLLECTION_NAME)
    await positionsCollection.deleteMany({})
    await positionsCollection.createIndex({ "lastUpdated": 1 }, { expireAfterSeconds: 30 })
    await positionsCollection.createIndex({ location: "2dsphere" })
    const positions = [
      positionCreator(12.541859149932861, 55.704972756583516, team1.username, team1.name, true),
      positionCreator(12.529220581054686, 55.70344328869088, team2.username, team2.name, true),
      positionCreator(12.53291130065918, 55.71226864306213, team3.username, team3.name, true),
      positionCreator(12.51, 55.77, "xxx", "yyy", false),
    ]
    const locations = await positionsCollection.insertMany(positions)
    POST_COLLECTION_NAME
    const postCollection = db.collection(POST_COLLECTION_NAME)
    await postCollection.deleteMany({})
    const posts = await postCollection.insertMany([{
      _id: "Post1",
      task: { text: "1+1", isUrl: false },
      taskSolution: "2",
      location: {
        type: "Point",
        coordinates: [12.49, 55.77]
      }
    },
    {
      _id: "Post2",
      task: { text: "4-4", isUrl: false },
      taskSolution: "0",
      location: {
        type: "Point",
        coordinates: [12.4955, 55.774]
      }
    }]);
    console.log(`Inserted ${posts.insertedCount} test Posts`)

    console.log(`Inserted ${status.insertedCount} test users`)
    console.log(`Inserted ${locations.insertedCount} test Locationa`)
    console.log(`NEVER, NEVER, NEVER run this on a production database`)

  } catch (err) {
    console.error(err)
  } finally {
    client.close();
  }
})()