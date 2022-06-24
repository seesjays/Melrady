const path = require("path");

const express = require("express");
const searchRouter = express.Router();

const SpotifyWebApi = require("spotify-web-api-node");


function search(sharedObjects) {
	const auth = sharedObjects.authentication;
	const { body, validationResult } = require("express-validator");

	searchRouter.get("/search", auth, (req, res) => {
		console.log("search: search hit, serving search page");
		return res.sendFile(path.join(__dirname, "search.html"));
	});

	searchRouter.post(
		"/search",
		auth,
		body("track_1_name", "track_2_name", "track_3_name", "track_4_name")
			.isString()
			.isLength({ min: 0, max: 40 })
			.trim()
			.blacklist("<>&'\"/")
			.escape(),
		async (req, res) => {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				console.log("tracksearch: didn't pass validation");
				return res.status(400).json({
					message: "tracksearch: error - invalid inputs",
					errors: errors.array(),
				});
			}

			// operating under the assumption that access token exists in req body already thanks to middleware
			// but still double checking anyway
			const accessToken = req.headers.authorization;
			try {
				if (accessToken) {
					const spotifyAPI = new SpotifyWebApi();
					spotifyAPI.setAccessToken(accessToken);

					// valid escaped strings with a max length of 40
					// 40 was a number I picked kind of at random, but it should cover like
					// 90% of songs, easy.
					const queries = Object.values(req.body).filter(
						(query) => query.length > 0 && query.length <= 40
					);
					console.log(`tracksearch: searching ${queries.length} tracks:`);
					console.dir(queries);

					const { createTrackObject } = require("./trackObject");
					const output = await Promise.all(
						queries.map(async (query) => {
							const searchResults = await spotifyAPI.searchTracks(query, {
								limit: 3,
							});

							// search results are massive, so we filter down the values
							// into nice packaged objects using createTrackObject

							if (searchResults) {
								const trackObjects = Object.values(
									searchResults.body.tracks.items
								).map((fullData) => createTrackObject(fullData));
								return trackObjects;
							} else {
								return null;
							}
						})
					);

					// Promise.all returns everything in the same order it was fed, which is nice.
					console.log(`tracksearch: returning ${output.length} result arrays:`);
					console.dir(output.map((trackObjectArray) => {
						return trackObjectArray.map((trackObject) => {
							return trackObject.trackData.trackName;
						})
					}));
					return res.json(output);
				}
			} catch (error) {
				console.error("search error: " + error);
				return res.status(400).send([]);
			}
		}
	);

	return searchRouter;
}

module.exports = search;
