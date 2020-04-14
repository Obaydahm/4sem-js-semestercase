import express from "express";
import gameFacade from "../facades/gameFacade";
const router = express.Router();
import { ApiError } from "../errors/apiError"

//import * as mongo from "mongodb"
import setup from "../config/setupDB"
import userFacade from '../facades/userFacadeWithDB';

(async function setupDB() {
	const client = await setup()
	gameFacade.setDatabase(client)
})()

router.get('/', function (req, res, next) {
	res.send("works");
})

router.post('/nearbyplayers', async function (req, res, next) {
	try {
		const { username, password, lon, lat, distance } = req.body;

		if (isNaN(lon) || isNaN(lat) || isNaN(distance)) throw new ApiError("Longitude, Latitude and Distance must be numeric", 422);

		const nearbyPlayers = await gameFacade.nearbyPlayers(username, password, lon, lat, distance);
		res.json(nearbyPlayers)
	} catch (err) {
		next(err)
	}

})
router.post('/getPostIfReached', async function (req, res, next) {
	throw new Error("Not yet implemented")
})

module.exports = router;