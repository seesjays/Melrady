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
			.trim()
			.blacklist("<>&'\"/")
			.escape(),
		async (req, res) => {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(400).json({
					message: "tracksearch: error - invalid inputs",
					errors: errors.array(),
				});
			}

			console.log(
				`tracksearch: searching ${Object.keys(req.body).length} tracks:`
			);

			console.dir(req.body);

			const { access_tok_key } = require("./cookieMapping").cookieMap;
			const cookies = req.cookies ? req.cookies : null;
			const access_token = cookies ? cookies[access_tok_key] : null;

			const { createTrackObject } = require("./trackObject");
			let trackouts = [];

			const output = await Promise.all(
				Object.values(req.body)
					.filter((query) => query.length > 0)
					.map(async (query, index) => {
						spotify_api.setAccessToken(access_token);

						const searchResults = await spotify_api.searchTracks(query, {
							limit: 3,
						});

						if (searchResults) {
							for (const searchresult of searchResults.body.tracks.items) {
								const trackobj = createTrackObject(searchresult);

								console.log(trackobj);
							}
							return searchResults;
						} else {
							for (let i = 0; i < 3; i++) {
								let trackobj = create_dummy_track_obj();
								trackobj.search_box_num = trackin[0][6];

								search_results.push(trackobj);
							}
						}
					})
			);

			console.log(`search: Successfully searched ${output.length} songs.`);
			return res.json(output);
		}
	);

	return searchRouter;
}

module.exports = search;
