const path = require("path");

const express = require("express");
const searchRouter = express.Router();

function search(sharedObjects) {
	const auth = sharedObjects.authentication;
	const spotify_api = sharedObjects.spotify_api;
	const { body, validationResult } = require("express-validator");

	// operating under the assumption that access token exists in cookies already thanks to middleware
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

			// valid escaped strings with a max length of 40
			// 40 was a number I picked kind of at random, but it should cover like
			// 90% of songs, easy.

			const queries = Object.values(req.body).filter(
				(query) => query.length > 0
			);
			console.log(`tracksearch: searching ${queries.length} tracks:`);
			console.dir(queries);

			const { access_tok_key } = require("./cookieMapping").cookieMap;
			const cookies = req.cookies ? req.cookies : null;
			const access_token = cookies ? cookies[access_tok_key] : null;

			const { createTrackObject } = require("./trackObject");
			const output = await Promise.all(
				queries.map(async (query) => {
					spotify_api.setAccessToken(access_token);
					const searchResults = await spotify_api.searchTracks(query, {
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
			console.log(`tracksearch: returning ${output.length} track objects:`);
			console.dir(output);
			return res.json(output);
		}
	);

	return searchRouter;
}

module.exports = search;
