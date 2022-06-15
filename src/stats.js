const express = require("express");
const statsRouter = express.Router();

function stats(sharedObjects) {
    const auth = sharedObjects.authentication;
    const spotify_api = sharedObjects.spotify_api;
    const { query, validationResult } = require("express-validator");

    statsRouter.get(
        "/stats",
        auth,
        query("track1", "track2", "track3", "track4").trim().escape(),
        async (req, res) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            // operating under the assumption that access token exists in req body already thanks to middleware
            // but still double checking anyway
            const accessToken = req.headers.authorization;
            if (accessToken) {
                const trackIDs = Object.values(req.query).filter(trackID => trackID.length > 0);

                // results are massive, so we filter down the values
                // into nice packaged objects using createTrackFeaturesObject
                const { createTrackObject } = require("./trackObject");
                const trackObjects = await spotify_api.getTracks(trackIDs).then(
                    (data) => {
                        return data.body.tracks.map((fulltrackData) => createTrackObject(fulltrackData));
                    },
                    (err) => {
                        console.error("stats: error fetching track objects - " + err);
                        return null;
                    }
                );

                // attach stats and color data
                if (trackObjects) {
                    fetchFeaturesForSet(trackObjects).then(
                        (featureArray) => {
                            return calculateTrackColorSet(trackObjects).then(
                                (colorArray) => {
                                    return { features: featureArray, colors: colorArray };
                                }
                            );
                        }
                    ).then(
                        (fAndCArrays) => {
                            // 2 arrays, both in the same order as our track objects
                            // one is an array of track feature data
                            // the other is an array of colros

                            fAndCArrays.features.forEach((featureData, index) => {
                                trackObjects[index].features = featureData;
                            });
                            fAndCArrays.colors.forEach((color, index) => {
                                trackObjects[index].color = color;
                            });

                            return res.render("pages/stats", {
                                trackObjects: trackObjects,
                            });
                        }
                    );
                }
            }
        }
    );

    // returns a Promise that resolves 
    // to an array of track feature data
    const fetchFeaturesForSet = async (trackObjects) => {
        const { createTrackFeaturesObject } = require("./trackObject");
        return spotify_api.getAudioFeaturesForTracks(trackObjects.map((trackObject) => trackObject.trackData.trackId))
            .then(
                (data) => {
                    const featureSetArray = data.body.audio_features;
                    return featureSetArray.map((featureSet) => createTrackFeaturesObject(featureSet));
                },
                (err) => {
                    // failed to get feature data, rediredt user back to search page
                }
            );
    }

    const calculateTrackColorSet = async (trackObjects) => {
        const Vibrant = require("node-vibrant");

        return Promise.all(trackObjects.map(
            (trackObject) => {
                return Vibrant.from(trackObject.trackData.albumArt)
                    .getPalette()
                    .then(
                        (color) => {
                            let vib = color.Vibrant;
                            return vib._rgb;
                        },
                        (err) => {
                            console.log("no color");
                            track.track_color = null;
                        }
                    );
            }
        ));
    }

    return statsRouter;
}

module.exports = stats;