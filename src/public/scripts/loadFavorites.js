/*
    Gives all the track input elements some
    nice placeholders that match what the user
    would probably search for
    (their all time favorite tracks)
    Runs once on page load.
*/
const loadFavorites = () => {
    // should be an array of up to 16 track objects
    fetch("/favies").then((response) => response.json()).then(
        (favoriteTracks) => {
            if (favoriteTracks.length > 4) {
                shuffleTrackObjects(favoriteTracks);

                // pick four from the end
                // of the shuffled array, make some basic placeholder queries:
                /*
                    song name
                    song name, album name
                    song name, artist name
                    song name, album name, artist name
                */
                const selecteds = favoriteTracks.slice(-4);

                const descA = selecteds[0].trackData.trackName;
                const descB = `${selecteds[1].trackData.trackName}, ${selecteds[1].trackData.albumName}`;
                const descC = `${selecteds[2].trackData.trackName}, ${selecteds[2].trackData.primaryArtists[0].name}`;
                const descD = `${selecteds[3].trackData.trackName}, ${selecteds[3].trackData.albumName}, ${selecteds[3].trackData.primaryArtists[0].name}`;
                const descArray = [descA, descB, descC, descD];

                return descArray;
            }
            else {
                // The user hasn't listened to 4 songs over the past year, just using a placeholder
                // from one of my favorites for them.
                return dummyPlaceholders;
            }
        },
        (err) => {
            console.error("searchPage: error fetching favies", err);
            return dummyPlaceholders;
        }
    ).then((placeholders) => {
        // The prior function either gives us real placeholders or the dummy values
        // We assign the placeholders to the inputs here
        placeholders.forEach((description, index) => {
            $(`#track-${index + 1}-name`).attr("placeholder", description);
        });
    });

    // modern Fisher-Yates
    function shuffleTrackObjects(trackObjects) {
        for (let indexA = trackObjects.length - 1; indexA > 0; indexA--) {
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