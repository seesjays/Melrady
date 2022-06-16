// wanna set a very distinct shape for track objects,
// as well as simplify their creation
// no more normalizing and adding feature sets

// Features and color attributes will be attached in the /stats route
exports.createTrackObject = (fullTrackData) => {
	const track = {
		trackData: {
			trackId: fullTrackData.id,
			trackName: fullTrackData.name,
			trackURL: fullTrackData.external_urls.spotify,
			albumName: fullTrackData.album.name,
			albumArt: fullTrackData.album.images[1].url,
			albumURL: fullTrackData.album.external_urls.spotify,
			primaryArtists: fullTrackData.album.artists,
			trackArtists: fullTrackData.artists,
			isExplicit: fullTrackData.explicit,
		},
		features: null,
		color: null,
	};

	return track;
};

exports.createTrackFeaturesObject = (fullTrackFeatureData) => {
	// Absolute features are attached in the backend,
	// while relative ones are calculated in the frontend
	const features = {
		absolute: {
			acousticness: fullTrackFeatureData.acousticness,
			danceability: fullTrackFeatureData.danceability,
			duration: fullTrackFeatureData.duration_ms / 1000,
			energy: fullTrackFeatureData.energy,
			instrumentalness: fullTrackFeatureData.instrumentalness,
			loudness: fullTrackFeatureData.loudness + 60,
			speechiness: fullTrackFeatureData.speechiness,
			tempo: fullTrackFeatureData.tempo,
			valence: fullTrackFeatureData.valence,
		},
		relative: {},
	};

	return features;
}