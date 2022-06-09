require("dotenv").config();

const { body, query, validationResult } = require("express-validator");

const cookieParser = require("cookie-parser");

const Vibrant = require("node-vibrant");

const express = require("express"); // Express web server framework
const path = require("path");
const cors = require("cors");
const SpotifyWebApi = require("spotify-web-api-node");

const PORT = process.env.PORT || 8888;
const CLIENT_ID = process.env.CLIENT_ID;
const SECRET_KEY = process.env.SECRET_KEY;
const RED_URI = process.env.RED_URL || `http://localhost:${PORT}/search`; // Your redirect uri

const spotify_api = new SpotifyWebApi({
	clientId: CLIENT_ID,
	clientSecret: SECRET_KEY,
	redirectUri: RED_URI,
});

const { auth } = require("./auth");
const sharedObjects = {
	spotify_api: spotify_api,
	authentication: auth(spotify_api)
}

const search = require("./search");

let app = express();
app
	.use(express.static(path.join(__dirname, "public")))
	.use(express.json())
	.use(
		express.urlencoded({
			extended: true,
		})
	)
	.use(cookieParser())
	.use(search(sharedObjects));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

const {
	state_key,
	access_tok_key,
	refresh_tok_key,
} = require("./cookieMapping");

const execute_with_access_token = async (cookie, callback) => {
	spotify_api.setAccessToken(cookie);
	callback instanceof Function && (await callback());
	spotify_api.resetAccessToken();
};

app.get("/asdawd", (req, res) => {
	// check if there's an access token in cookies
	// if not, check if there's a refresh token in cookies, then refresh access token
	// if neither, or refreshing token results in error, authenticate using Spotify's Code Grant Path
	let cookies = req.cookies ? req.cookies : null;

	let access_token = cookies ? cookies[access_tok_key] : null;
	let refresh_token = cookies ? cookies[refresh_tok_key] : null;

	console.log("\nAuth point hit");
	if (access_token && refresh_token) {
		console.log("Access token present, redirecting to search\n");
		res.redirect("/search");
	} else if (refresh_token) {
		console.log("Refreshing access token");

		spotify_api.setRefreshToken(refresh_token);

		spotify_api.refreshAccessToken().then(
			(data) => {
				res.cookie(access_tok_key, data.body["access_token"], {
					// spotify puts their time in seconds instead of ms
					maxAge: data.body["expires_in"] * 1000,
				});
				spotify_api.resetRefreshToken();

				return res.redirect("/search");
			},
			(err) => {
				console.log("error on access token refresh:" + err + "\n");
				return res.redirect("/");
			}
		);
	} else {
		console.log(
			"No access or refresh token, requesting authorization from spotify\n"
		);

		let authorizeURL_state = gen_auth_link();
		res.cookie(state_key, authorizeURL_state[1]);
		return res.redirect(authorizeURL_state[0]);
	}
});

app.get("/privacy", (req, res) => {
	return res.sendFile(path.join(__dirname, "/public/privacy.html"));
});

const create_track_obj = (track) => {
	let track_object = {
		track_id: track.id,
		track_name: track.name,
		track_album: track.album.name,
		track_album_url: track.album.external_urls.spotify,
		track_artists: track.artists,
		track_artist: track.album.artists,
		track_artist_url: track.artists[0].external_urls.spotify,
		track_image: track.album.images[1].url,
		track_url: track.external_urls.spotify,
		track_color: null,
		track_features: null,
		normalized_features: null,
	};

	return track_object;
};

const create_dummy_track_obj = () => {
	let dummy_obj = {
		track_id: "1UKk6maDt5HXQCriDiZWP5",
		track_name: "Technical Difficulties",
		track_album: "Portal 2: Songs to Test By (Collectors Edition)",
		track_image:
			"https://i.scdn.co/image/ab67616d00001e0294008f6625cab88b318e3c49",
		track_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=2s",
		track_artist_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=2s",
		track_album_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=2s",
		track_color: [227, 166, 133],
		track_features: {
			acousticness: 0.963,
			danceability: 0.222,
			duration: 203.133,
			energy: 0.19,
			instrumentalness: 0.948,
			loudness: 38.979,
			speechiness: 0.0401,
			tempo: 146.665,
			valence: 0.0475,
		},
		normalized_features: {
			acousticness: 1,
			danceability: 1,
			duration: 1,
			energy: 1,
			instrumentalness: 1,
			loudness: 1,
			speechiness: 1,
			tempo: 1,
			valence: 1,
		},
	};

	return dummy_obj;
};

const add_feature_set = (track, feature_set) => {
	const feature_set_object = {
		acousticness: feature_set.acousticness,
		danceability: feature_set.danceability,
		duration: feature_set.duration_ms / 1000,
		energy: feature_set.energy,
		instrumentalness: feature_set.instrumentalness,
		loudness: feature_set.loudness + 60,
		speechiness: feature_set.speechiness,
		tempo: feature_set.tempo,
		valence: feature_set.valence,
	};

	const normalized_features_object = {
		acousticness: 0,
		danceability: 0,
		duration: 0,
		energy: 0,
		instrumentalness: 0,
		loudness: 0,
		speechiness: 0,
		tempo: 0,
		valence: 0,
	};

	track.track_features = feature_set_object;
	track.normalized_features = normalized_features_object;
};

const normalize_tracklist = (tracks_with_feature_sets) => {
	const det_stats = {
		totals: {
			acousticness: 0,
			danceability: 0,
			duration: 0,
			energy: 0,
			instrumentalness: 0,
			loudness: 0,
			speechiness: 0,
			tempo: 0,
			valence: 0,
		},

		averages: {},

		minimums: {},

		maximums: {},
	};

	// collect mins and maxes, normalize, totals, average
	for (let track_obj of tracks_with_feature_sets) {
		let features = track_obj.track_features;

		// mins, maxes
		for (let feature_singular in features) {
			det_stats.minimums[feature_singular] =
				det_stats.minimums[feature_singular] ?? Number.MAX_SAFE_INTEGER;
			det_stats.maximums[feature_singular] =
				det_stats.maximums[feature_singular] ?? 0;

			if (features[feature_singular] < det_stats.minimums[feature_singular]) {
				det_stats.minimums[feature_singular] = features[feature_singular];
			}

			if (features[feature_singular] > det_stats.maximums[feature_singular]) {
				det_stats.maximums[feature_singular] = features[feature_singular];
			}
		}
	}

	// normalize amd total
	for (let track_obj of tracks_with_feature_sets) {
		for (let track_feature in track_obj.track_features) {
			det_stats.totals[track_feature] +=
				track_obj.track_features[track_feature];

			track_obj.normalized_features[track_feature] =
				track_obj.track_features[track_feature] /
				det_stats.maximums[track_feature];
		}
		//console.dir(track_obj);
	}

	// averaging
	const track_cnt = tracks_with_feature_sets.length;
	for (let feature in det_stats.totals) {
		det_stats.averages[feature] = det_stats.totals[feature] / track_cnt;
	}

	return det_stats;
};

const search_track = async (trackin) => {
	let track_name_search_results = await spotify_api.searchTracks(trackin[1], {
		limit: 3,
	});

	let search_results = [];
	if (track_name_search_results) {
		for (let searchresult of track_name_search_results.body.tracks.items) {
			let trackobj = create_track_obj(searchresult);

			trackobj.search_box_num = trackin[0][6];
			search_results.push(trackobj);
		}
	} else {
		for (let i = 0; i < 3; i++) {
			let trackobj = create_dummy_track_obj();
			trackobj.search_box_num = trackin[0][6];

			search_results.push(trackobj);
		}
	}

	return search_results;
};

app.post(
	"/tracksearch",
	body("track_1_name").trim().blacklist("<>&'\"/").escape(),
	body("track_2_name").trim().blacklist("<>&'\"/").escape(),
	body("track_3_name").trim().blacklist("<>&'\"/").escape(),
	body("track_4_name").trim().blacklist("<>&'\"/").escape(),
	async (req, res) => {
		console.log("Track search hit");
		console.log(req.body);

		let cookies = req.cookies ? req.cookies : null;

		let access_token = cookies ? cookies[access_tok_key] : null;
		let refresh_token = cookies ? cookies[refresh_tok_key] : null;

		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		let trackouts = [];
		try {
			for (let searchbox in req.body) {
				let trackname = req.body[searchbox];
				if (trackname.length > 0) {
					await execute_with_access_token(access_token, async () => {
						let search_result_list = await search_track([searchbox, trackname]);
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

app.get(
	"/stats",
	query("track1").trim().escape(),
	query("track2").trim().escape(),
	query("track3").trim().escape(),
	query("track4").trim().escape(),
	async (req, res) => {
		const authcookie = req.cookies[access_tok_key];

		const outtracks = [];

		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		if (authcookie) {
			const trackids = [];

			// console.log(req.query);

			if (req.query["test"]) {
				// testing
				let testset = req.query["test"];

				console.log("TEST SET: ");

				if (testset === "faves") {
					console.log("FAVES");

					trackids.push(
						"0Zm7NKJgoKY6ZWwtoEUILK",
						"7qfoq1JFKBUEIvhqOHzuqX",
						"2Im64pIz6m0EJKdUe6eZ8r",
						"0wXuerDYiBnERgIpbb3JBR"
					);
				} else if (testset === "donda") {
					console.log("DONDA");

					trackids.push(
						"0Zm7NKJgoKY6ZWwtoEUILK",
						"2ZUJsR8HEktit58X6FuPQM",
						"2gbMPBrBVj3CuNTLp2dHYs",
						"1aF9TeHZbe6OVo9dtjPuzK"
					);
				} else if (testset === "instru") {
					console.log("INSTRUMENTALS");

					trackids.push(
						"3Pwmf3xVA8MV6h2isY6whx",
						"4p6GbcE3GjJs7JzhVBv2uT",
						"79aotvPXTlHbZ8MvoxhqAE",
						"4COR2ZPEyUn0lsbAouRWxA"
					);
				} else if (testset === "ethan") {
					console.log("ETHAN");

					trackids.push(
						"6Qyc6fS4DsZjB2mRW9DsQs",
						"1tD8J13a74q8fBqXwAP50j",
						"75JFxkI2RXiU7L9VXzMkle",
						"5NDUXbMwcnTQp66tI2zcdR"
					);
				}
			} else {
				for (track in req.query) {
					let trck = req.query[track];

					if (trck.length > 0) {
						trackids.push(req.query[track]);
					}
				}
			}

			await execute_with_access_token(authcookie, async () => {
				await spotify_api.getTracks(trackids).then(
					(data) => {
						for (let track of data.body.tracks) {
							let track_obj = create_track_obj(track);
							outtracks.push(track_obj);
						}
					},
					(err) => {
						console.log("whoopsies on getting tracks for stats", err.message);
						return res.redirect("/");
					}
				);

				for (let track of outtracks) {
					await Vibrant.from(track.track_image)
						.getPalette()
						.then(
							(color) => {
								let vib = color.Vibrant;
								track.track_color = vib._rgb;
							},
							(err) => {
								console.log("no color");
								track.track_color = null;
							}
						);
				}
			});

			await execute_with_access_token(authcookie, async () => {
				await spotify_api
					.getAudioFeaturesForTracks(outtracks.map((track) => track.track_id))
					.then(
						(data) => {
							let features = data.body.audio_features;

							features.forEach((feature_set) => {
								let track_features_id = feature_set.id;
								let matched_track = outtracks.find(
									(track) => track.track_id === track_features_id
								);

								add_feature_set(matched_track, feature_set);
							});

							const det_stats = normalize_tracklist(outtracks);

							// console.dir(det_stats);

							let tracks_and_data = {
								tracks: outtracks,
								full_data: det_stats,
							};

							return res.render("pages/stats", {
								tracks_data: tracks_and_data,
							});
						},
						(err) => {
							console.log(
								"whoopsies on getting audio features from tracks",
								err.message
							);
							return res.redirect("/");
						}
					);
			});
		} else {
			res.redirect("/authorize");
		}
	}
);

const get_faves = (count) => {
	return new Promise((resolve, reject) => {
		spotify_api.getMyTopTracks({ limit: count }).then(
			(data) => {
				const tops = [];
				for (let track of data.body.items) {
					let trackobj = create_track_obj(track);
					tops.push(trackobj);
				}
				resolve(tops);
			},
			(err) => {
				reject(new Error("Couldn't get top tracks."));
			}
		);
	});
};

app.get("/favies", (req, res) => {
	console.log("Fave tracks hit");

	let cookies = req.cookies ? req.cookies : null;
	let access_token = cookies ? cookies[access_tok_key] : null;
	const count = 16;
	if (access_token) {
		spotify_api.setAccessToken(access_token);
		get_faves(count).then(
			(data) => {
				return res.status(200).json({ faves: data });
			},
			(err) => {
				return res
					.status(400)
					.json({ faves: Array(count).fill("Enter 1-4 tracks.") });
			}
		);
		spotify_api.resetAccessToken();
	} else {
		return res
			.status(400)
			.json({ faves: Array(count).fill("Enter 1-4 tracks.") });
	}
});

app.get("/logout", (req, res) => {
	console.log("logging user out");
	let cookies = [state_key, access_tok_key, refresh_tok_key];
	cookies.forEach((cookie) => {
		res.clearCookie(cookie);
	});
	res.redirect("/");
});

app.get("/robots.txt", function (req, res) {
	res.type("text/plain");
	return res.send(
		"User-agent: *\nDisallow: /stats\nDisallow: /search\nDisallow: /tracksearch"
	);
});

console.log(`Listening on ${PORT}`);
app.listen(PORT);
