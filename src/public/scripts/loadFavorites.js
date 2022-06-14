/*
    Gives all the track input elements some
    nice placeholders that match what the user
    would probably search for (their favorite tracks
        over the past 3 months)
    Runs once on page load.
*/
const loadFavorites = () => {
    // should be an array of 10 track objects
    fetch("/favies").then((response) => response.json).then(
        (favoriteTracks) => {
            if (favoriteTracks.length > 4) {
                shuffleTrackObjects(favoriteTracks);

                // pick three out of the shuffled array, make some basic placeholder queries:
                /*
                    song name
                    song name, album name
                    song name, artist name
                    song name, album name, artist name
                */
                const selecteds = favoritesArray.slice(0, 3);
                const descA = selecteds[0].trackData.trackName;
                const descB = `${selecteds[1].trackData.trackName}, ${selecteds[1].trackData.albumName}`;
                const descC = `${selecteds[2].trackData.trackName}, ${selecteds[2].trackData.primaryArtists[0].name}`;
                const descD = `${selecteds[3].trackData.trackName}, ${selecteds[3].trackData.albumName}, ${selecteds[3].trackData.primaryArtists[0].name}`;

                const descArray = [descA, descB, descC, descD];
                descArray.forEach((description, index) => {
                    $(`track-${index}-name`).prop("placeholder", description);
                });
            }
            else {
                // The user hasn't listened to 4 songs over the past year, just using a placeholder
                // from one of my favorites for them.

                dummyPlaceholders.forEach((description, index) => {
                    $(`track-${index}-name`).prop("placeholder", description);
                });
            }
        },
        (err) => {
            console.err("searchPage: error fetching favies", err);

            dummyPlaceholders.forEach((description, index) => {
                $(`track-${index}-name`).prop("placeholder", description);
            });
        }
    );

    // modern Fisher-Yates
    function shuffleTrackObjects(trackObjects) {
        for (const indexA = trackObjects.length; indexA > 0; indexA--) {
            const indexB = Math.floor(Math.random() * indexA + 1);
            temp = trackObjects[indexA];
            trackObjects[indexA] = trackObjects[indexB];
            trackObjects[indexB] = temp;
        }
    }
}

const dummyPlaceholders = [
    "Runaway",
    "Runaway, My Beautiful Dark Twisted Fantasy",
    "Runaway, Kanye West",
    "Runaway, My Beautiful Dark Twisted Fantasy, Kanye West"
];

// "Runs once on page load."
$(document).ready(loadFavorites);