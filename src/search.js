const path = require("path");

const express = require("express");
const searchRouter = express.Router();

function search(sharedObjects) {
	const auth = sharedObjects.authentication;

	// operating under the assumption that access token exists in cookies already thanks to middleware
	searchRouter.get("/search", auth, (req, res) => {
		console.log("search: search hit, serving search page");
		return res.sendFile(path.join(__dirname, "search.html"));
	});

	return searchRouter;
}

module.exports = search;
