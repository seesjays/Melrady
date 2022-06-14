const express = require("express");
const faviesRouter = express.Router();

function favies(sharedObjects) {
    const auth = sharedObjects.authentication;
    const spotify_api = sharedObjects.spotify_api;

    // operating under the assumption that access token exists in cookies already thanks to middleware
    faviesRouter.get("/favies", auth, async (req, res) => {
        const { access_tok_key } = require("./cookieMapping").cookieMap;
        const cookies = req.cookies ? req.cookies : null;
        const access_token = cookies ? cookies[access_tok_key] : null;

        const count = 16;
        if (access_token) {
            spotify_api.setAccessToken(access_token);

            const { createTrackObject } = require("./trackObject");
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
