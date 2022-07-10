require("dotenv").config();

const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");

const PORT = process.env.PORT || 8888;
const CLIENT_ID = process.env.CLIENT_ID;
const SECRET_KEY = process.env.SECRET_KEY;
const RED_URI = process.env.RED_URL || `http://localhost:${PORT}/search`; // Your redirect uri

const SpotifyWebApi = require("spotify-web-api-node");
const spotify_api = new SpotifyWebApi({
	clientId: CLIENT_ID,
	clientSecret: SECRET_KEY,
	redirectUri: RED_URI,
});

const { auth } = require("./auth");
const sharedObjects = {
	authentication: auth(spotify_api),
};

const search = require("./search");
const stats = require("./stats");
const favies = require("./favies");


let app = express();
app
	.use(express.static(path.join(__dirname, "public")))
	.use(express.static(path.join(__dirname, "publicMeta"))) // didn't want to use a subdir in public for <meta> stuff
	.use(express.json())
	.use(
		express.urlencoded({
			extended: true,
		})
	)
	.use(cookieParser())
	.use(search(sharedObjects))
	.use(stats(sharedObjects))
	.use(favies(sharedObjects));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

const {
	state_key,
	access_tok_key,
	refresh_tok_key,
} = require("./cookieMapping").cookieMap;

app.get("/privacy", (req, res) => {
	return res.sendFile(path.join(__dirname, "/public/privacy.html"));
});

app.get("/logout", (req, res) =>
{
	console.log("logging user out");
	let cookies = [state_key, access_tok_key, refresh_tok_key];
	res.clearCookie(access_tok_key);
	cookies.forEach((cookie) => {
		res.clearCookie(cookie);
	});
	res.redirect("/");
});

app.get("/robots.txt", (req, res) => {
	res.type("text/plain");
	return res.send(
		"User-agent: *\nDisallow: /stats\nDisallow: /search\nDisallow: /tracksearch"
	);
});

console.log(`Listening on ${PORT}`);
app.listen(PORT);
