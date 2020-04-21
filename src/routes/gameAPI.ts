import express from "express";
import gameFacade from "../facades/gameFacade";
const router = express.Router();
import { ApiError } from "../errors/apiError";
const {gameArea,players} = require("../utils/gameData");
//import * as mongo from "mongodb"
import setup from "../config/setupDB";
import userFacade from '../facades/userFacadeWithDB';
const gju = require("geojson-utils");

(async function setupDB() {
	const client = await setup()
	gameFacade.setDatabase(client)
})()

const polygonForClient = {coordinates: null};
polygonForClient.coordinates = gameArea.coordinates[0].map((point:Array<Number>) => {
  return {latitude: point[1],longitude: point[0]}
})


router.get('/', function (req, res, next) {
	res.send("works");
})

router.get('/gamearea', function (req, res, next) {
	res.json(polygonForClient);
})

router.get('/isuserinarea/:lon/:lat', function(req, res, next) {
	const lon = req.params.lon;
	const lat = req.params.lat;
	const point = {"type":"Point","coordinates":[lon,lat]}
	let isInside = gju.pointInPolygon(point,gameArea);
	let result = {status:false, msg:""};
	result.status = isInside;
	let msg = isInside ? "Point was inside the tested polygon":
						 "Point was NOT inside tested polygon";
	result.msg = msg;
	res.json(result);
  });

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