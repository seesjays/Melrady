const testTrack = {
	search_box_num: 4,
	album: "Yeezus",
	title: "Guilt Trip",
};

const testTracks = [testTrack, testTrack, testTrack];

let resultGroups = [];
let selectedTracks = [];

$("#search-button").click(() => {
	// mitigate submit spam
	//$("#search-button").prop("disabled", true);
	hide_track_lists();

	if (searchQueryExists) {
		// submitting form for track object response
		$.post(
			"/search",
			$("#track-search-form").serialize(),

			(response) => {
				// should be an array consisting of arrays of 3 track objects
				console.dir(response);

				// no results. do nothing
				if (response.every(array => array.length == 0)) return;

				// clear out the previous result group and selected track stores
				resultGroups = response;
				selectedTracks = [];
				
				// resultDisplay.js
				displayResults(resultGroups);

				// albumDisplay.js
				initializeAlbumDisplay(resultGroups);
				
				return;

				response.forEach((resultGroup, index) => {
					const cardGroup = `#card-${index + 1}-list`;

					for (result of resultGroup) {
						const artistNames = result.trackArtists.map(artist => artist.name).join(", ");

						$(cardGroup).append(
							`
							<div class="track-option" data-song-id=${result.trackId}>
								<h5 class="card-title">${result.trackName}</h5>
								<h6 class="card-subtitle mb-2 text-muted">${result.albumName}</h6>
								<h6 class="card-subtitle mb-2 text-muted">${artistNames}</h6>
							</div>
							`
						);
					}
				});


				update_selections_and_link();

				$(".track-option").click(function () {
					let list_parent_id = $(this).parent().attr("id");
					let track_option_track_id = $(this).attr("data-song-id");

					if (Object.values(track_ids).includes(track_option_track_id)) {
						delete track_ids[list_parent_id];
						update_selections_and_link();

						// remove highlight
						$(this).siblings().removeClass("selected-track");
						$(this).removeClass("selected-track");

						return;
					}

					track_ids[list_parent_id] = track_option_track_id;

					update_selections_and_link();

					// set highlight
					$(this).siblings().removeClass("selected-track");
					$(this).removeClass("selected-track");
					$(this).addClass("selected-track");
				});

				// wait for collapse anim
				setTimeout(() => {
					show_track_lists();
					$("#search-button").prop("disabled", false);
				}, 500);
			},
			"json"
		);
	}

	// returns true if any inputs have values
	function searchQueryExists() {
		for (let i = 1; i < 5; i++) {
			if ($(`#track_${i}_name`).val() != "") {
				return true;
			}
		}

		return false;
	}
});






function update_selections_list() {
	Object.values(track_ids).map((track_id) => {
		const corresponding = track_objs[track_id];

		let track_cover_container = $("<a></a>").attr(
			"href",
			corresponding.track_url
		);
		track_cover_container.addClass(`col-6 col-sm-3 link-dark`);

		let track_image = $("<img>");
		track_image.attr("src", `${corresponding.track_image}`);
		track_image.attr("alt", `album cover for ${corresponding.track_name}`);
		track_image.addClass("album-cover img-fluid");

		let track_text = $(`<p></p>`)
			.text(`${corresponding.track_name}`)
			.css({ "text-align": "center" })
			.addClass("link-dark");

		track_cover_container.append(track_image);
		track_cover_container.append(track_text);
		$("#album-cover-row").append(track_cover_container);
	});
}

function update_selections_and_link() {
	let new_query = generateStatsLink(selectedTracks);

	$("#selections-label").text("");
	update_selections_list();

	if (new_query.length === 0) {
		$("#selections-label").text("No tracks selected. ");
		$("#stats-button").addClass("disabled");
		$("#stats-button").attr("href", `/stats/`);
	} else {
		$("#selections-label").text("Selections: ");
		$("#stats-button").removeClass("disabled");
		$("#stats-button").attr("href", `/stats/?${new_query}`);
	}

	function generateStatsLink(tracks) {
		const statsQuery = tracks.reduce(
			(partialQuery, trackObject, index) => partialQuery + `track${index + 1}=${trackObject.trackId}&`,
			"/stats?"
		);

		// remove trailing &
		return statsQuery.substring(0, statsQuery.length - 1);
	}
}

function hide_track_lists() {
	$(".accordion-collapse").collapse("hide");
	for (let i = 1; i < 5; i++) {
		$(`#card-${i}-list`).empty();
	}
}

function show_track_lists() {
	for (let i = 1; i < 5; i++) {
		$(`#card-${i}-list`).children().length > 0 &&
			$(`#card-${i}-list`).slideDown(250);
		$(`#card-${i}-list`).children().length > 0 &&
			$(`#track-${i}-accordion`).collapse("show");
	}
}

$("#reset-button").click(() => {
	hide_track_lists();
	Object.keys(track_ids).forEach((track) => delete track_ids[track]);
	track_objs = {};
	update_selections_and_link();
});

$(document).ready(function () {
	update_selections_and_link();
	hide_track_lists();
});
