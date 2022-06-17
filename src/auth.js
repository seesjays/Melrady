const { state_key, access_tok_key, refresh_tok_key } =
	require("./cookieMapping").cookieMap;

const express = require("express");

const auth = (spotify_api) => {
	const scopes = ["user-top-read"];
	const generateRandomString = (length) => {
		let text = "";
		let possible =
			"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

		for (let i = 0; i < length; i++) {
			text += possible.charAt(Math.floor(Math.random() * possible.length));
		}
		return text;
	};

	const gen_auth_link = () => {
		let state = generateRandomString(16);

		return [spotify_api.createAuthorizeURL(scopes, state), state];
	};

	return async function (req, res, next) {
		// check if there's an access token in cookies
		// if not, check if there's a refresh token in cookies, then refresh access token
		// if neither, or refreshing token results in error, authenticate using Spotify's Code Grant Path

		// these are for checking if the user is already authenticated
		const cookies = req.cookies ? req.cookies : null;
		const access_token = cookies ? cookies[access_tok_key] : null;
		const refresh_token = cookies ? cookies[refresh_tok_key] : null;

		// user is coming from spotify auth page, auth codes are in url
		const authentication_code = req.query.code ? req.query.code : null;

		console.log("\nauth: auth point hit");
		try {
			if (access_token) {
				// user is already authorized and token hasn't expired
				console.log("auth: access token found, continuing");
				req.headers.authorization = access_token;
				return next();
			} else if (refresh_token) {
				console.log("auth: refreshing access token");

				spotify_api.setRefreshToken(refresh_token);
				await spotify_api.refreshAccessToken().then(
					(data) => {
						const accessTokenCookie = data.body["access_token"];
						req.headers.authorization = accessTokenCookie;
						res.cookie(access_tok_key, accessTokenCookie, { maxAge: data.body["expires_in"] * 1000 });

						spotify_api.resetRefreshToken();
						return next();
					},
					(err) => {
						console.error(
							"auth: failed to refresh access token cause=",
							err.message
						);

						return res.status(401).send({
							message: "Authorization Error: " + err.message,
						});
					}
				);
			} else if (authentication_code) {
				// arrival of new user from spotify auth page
				// helps prevent xss
				const check_auth_state = (state, storedState) => state === storedState;

				const state = req.query.state;
				const stored_state = cookies ? cookies[state_key] : null;
				const states_match = check_auth_state(state, stored_state);

				if (states_match) {
					res.clearCookie(state_key);

					spotify_api.authorizationCodeGrant(authentication_code).then(
						(data) => {
							console.log(
								"auth: adding refresh+access tokens to cookies, sending to /search"
							);
							// console.log("auth: access token expires in " + data.body["expires_in"]);
							// console.log("auth: access token is " + data.body["access_token"]);
							// console.log("auth: refresh token is " + data.body["refresh_token"]);

							const accessTokenCookie = data.body["access_token"];
							req.headers.authorization = accessTokenCookie;
							res.cookie(access_tok_key, accessTokenCookie, { maxAge: data.body["expires_in"] * 1000 });
							res.cookie(refresh_tok_key, data.body["refresh_token"]);

							return res.redirect("/search");
						},
						(err) => {
							console.log(
								"auth: failed to obtain auth+refresh tokens cause=",
								err.message
							);

							return res.status(401).send({
								message: "Authorization Error: " + err.message,
							});
						}
					);
				} else {
					console.log("auth: state mismatch, dropping!", state, stored_state);
					return res.redirect("/");
				}
			} else {
				// entirely new user
				console.log(
					"auth: no access/refresh token, requesting auth from Spotify\n"
				);

				const authorizeURL_state = gen_auth_link();
				res.cookie(state_key, authorizeURL_state[1]);
				return res.redirect(authorizeURL_state[0]);
			}
		} catch (error) {
			console.error("auth error: " + error);
		}
	};
};

module.exports = { auth };
