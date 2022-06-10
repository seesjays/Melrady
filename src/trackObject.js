// wanna set a very distinct shape for track objects,
// as well as simplify their creation
// no more normalizing and adding feature sets

// Features and color attributes will be attached in the /stats route
exports.createTrackObject = (fullTrackData) => {
	const track = {
		trackData: {
			trackId: fullTrackData.id,
			trackName: fullTrackData.name,
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

/*
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
*/

exports.dummy_obj = {
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
