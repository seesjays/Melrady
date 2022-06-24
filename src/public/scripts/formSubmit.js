/*
	Responsible for making the request to /search for the track
	objects, saving them, then executing the functions necessary
	for forming the stats link (and providing a good UX :>)
*/
let resultGroups = [];

$("#search-button").click((e) => {
	e.preventDefault(); // prevents default form submit

	// mitigate submit spam somewhat
	$("#search-button").prop("disabled", true).html("Searching...");

	if (searchQueryExists()) {
		// submitting form for track object response
		$.post(
			"/search",
			$("#track-search-form").serialize(),
			(response) => {
				// response should be an array 
				// made up of arrays of 3 track objects

				$("#search-button").prop("disabled", false).html("Search Spotify");

				// no results. do nothing
				if (response.every(array => array.length == 0)) return;

				// replace stored result group with the results that 
				// have tracks in them
				resultGroups = response.filter(array => array.length > 0);

				// resultDisplay.js
				displayResults(resultGroups);
				// albumDisplay.js
				initializeAlbumDisplay(resultGroups);
				// statsButtonDisplay.js
				displayStatsButton();
			},
			"json"
		);
	}

	setTimeout(() => { $("#search-button").prop("disabled", false).html("Search Spotify"); }, 1500);

	// returns true if any inputs have values
	function searchQueryExists() {
		for (let i = 1; i < 5; i++) {
			if ($(`#track-${i}-name`).val() != "") {
				return true;
			}
		}
		return false;
	}
});
