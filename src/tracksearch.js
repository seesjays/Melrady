const express = require("express");
const trackSearchRouter = express.Router();

const { validationResult, sanitize } = require("express-validator");

const { access_tok_key } = require("./cookieMapping").cookieMap;

function trackSearch(sharedObjects) {
	const auth = sharedObjects.authentication;
	const spotify_api = sharedObjects.spotify_api;

	trackSearchRouter.post(
		"/tracksearch",
		auth,
		sanitize("track_1_name", "track_2_name", "track_3_name", "track_4_name")
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
				`tracksearch: searching the following ${req.body.length} tracks:`
			);
			console.dir(req.body);

			const access_token = cookies ? cookies[access_tok_key] : null;

			let trackouts = [];
			try {
				for (let searchbox in req.body) {
					let trackname = req.body[searchbox];
					if (trackname.length > 0) {
						await execute_with_access_token(access_token, async () => {
							let search_result_list = await search_track([
								searchbox,
								trackname,
							]);
							trackouts.push(search_result_list);
						});
					}
				}

				console.log(`Successfully searched ${trackouts.length} songs.`);
				console.log();

				return res.json(trackouts);
			} catch (err) {
				console.log("error in search");
				// Try to refresh access token
				if (refresh_token) {
					console.log("Search failure: Refreshing access token");

					spotify_api.setRefreshToken(refresh_token);
					spotify_api.refreshAccessToken().then(
						async (data) => {
							spotify_api.resetRefreshToken();

							let new_access_token = data.body["access_token"];

							trackouts = [];
							await execute_with_access_token(new_access_token, async () => {
								for (let searchbox in req.body) {
									let trackname = req.body[searchbox];
									if (trackname.length > 0) {
										let search_result_list = await search_track([
											searchbox,
											trackname,
										]).catch((err) => {
											return res.status(401).json({
												error:
													"Authentication error: Failed to access Spotify API with refreshed token",
											});
										});
										trackouts.push(search_result_list);
									}
								}
							});

							console.log(
								`Successfully refreshed access token on track search, searched ${trackouts.length} songs.`
							);
							console.log();

							res.cookie(access_tok_key, new_access_token, {
								// spotify puts their time in seconds instead of ms
								maxAge: data.body["expires_in"] * 1000,
							});
							return res.json(trackouts);
						},
						(err) => {
							console.log(
								"Failed to refresh access token on track search" + err.message
							);
							return res.status(401).json({
								error:
									"Authentication error: Invalid access token, could not refresh",
							});
						}
					);
				} else {
					return res
						.status(401)
						.json({ error: "Authentication error: Invalid access token" });
				}
			}
		}
	);

	return trackSearchRouter;
}

module.exports = trackSearch;
