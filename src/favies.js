const express = require("express");
const faviesRouter = express.Router();

function favies(sharedObjects) {
    const auth = sharedObjects.authentication;
    const spotify_api = sharedObjects.spotify_api;

    faviesRouter.get("/favies", auth, async (req, res) => {
        const count = 16;

        // operating under the assumption that access token exists in req body already thanks to middleware
        // but still double checking anyway
        const accessToken = req.headers.authorization;
        if (accessToken) {
            spotify_api.setAccessToken(accessToken);
            const { createTrackObject } = require("./trackObject");

            // query the top tracks for a user API, with a max item count of count and time range
            // extended over the user's entire account
            const favoriteTracks = await spotify_api.getMyTopTracks({ limit: count, time_range: "long_term" })
                .then(
                    (data) => {
                        if (data.body.items) {
                            console.log("favies: hit and returning " + data.body.items.length + " items.");
                            return data.body.items.map(trackData => createTrackObject(trackData));
                        }
                    },
                    (err) => {
                        console.err("favies: couldn't get top tracks - " + err);
                        return null;
                    }
                );

            if (favoriteTracks) return res.status(200).json(favoriteTracks);
        }
        return res.status(400).send([]);
    });

    return faviesRouter;
}

module.exports = favies;
