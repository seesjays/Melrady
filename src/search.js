// api object init
let spotify_api = null;
const initializeSearchRoute = (spotify_api_obj) => {
	spotify_api = spotify_api_obj;
	initializeAuthRoute(spotify_api);
};

const path = require("path");

const {
	state_key,
	access_tok_key,
	refresh_tok_key,
} = require("./cookieMapping").cookieMap;

const { auth, authFunc, initializeAuthRoute } = require("./auth");

const express = require("express");
const search = express.Router();

search.use(auth);

search.get("/search", (req, res) => {
    // operatig under the assumption that access token exists, thanks to middleware
    return res.sendFile(path.join(__dirname, "search.html"));

	// these are for checking if the user is already authenticated
	let cookies = req.cookies ? req.cookies : null;
	let access_token = cookies ? cookies[access_tok_key] : null;
	let refresh_token = cookies ? cookies[refresh_tok_key] : null;
	console.log("search: checking for authorization");

	if (access_token) {
		// user is already authorized and token hasn't expired
		console.log("search: access token found, serving search page");

		return res.sendFile(path.join(__dirname, "search.html"));
	} else if (refresh_token) {
		// access token expired, needs refreshing
		console.log("search: refresh token found, sending to /authorize");
		return res.redirect("/authorize");
	} else if (authentication_code) {
		// arrival from spotify auth page
		let state = req.query.state;
		let stored_state = cookies ? cookies[state_key] : null;
		let proper_state = check_authorization_state(state, stored_state);

		if (proper_state) {
			res.clearCookie(state_key);

			spotify_api.authorizationCodeGrant(authentication_code).then(
				(data) => {
					console.log("set refresh and access tokens, serving search page");
					// console.log("The token expires in " + data.body["expires_in"]);
					// console.log("The access token is " + data.body["access_token"]);
					// console.log("The refresh token is " + data.body["refresh_token"]);
					res.cookie(access_tok_key, data.body["access_token"], {
						maxAge: data.body["expires_in"] * 1000,
					});
					res.cookie(refresh_tok_key, data.body["refresh_token"]);

				},
				(err) => {
					console.log(
						"error on initial access and refresh tokens setting",
						err.message
					);
					return res.redirect("/");
				}
			);
		} else {
			console.log("state mismatch, redirecting to authorization");
			return res.redirect("/authorize");
		}
	} else {
		res.redirect("/");
	}
});

module.exports = { search, initializeSearchRoute };
