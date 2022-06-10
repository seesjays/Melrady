const testTrack = {
	search_box_num: 4,
	album: "Yeezus",
	title: "Guilt Trip",
};

const testTracks = {
	track_one: testTrack,
	track_two: testTrack,
	track_three: testTrack,
};

const track_ids = {};
let track_objs = {};

$("#search-button").click(() => {
	// mitigate submit spam
	$("#search-button").prop("disabled", true);
	hide_track_lists();

	if (searchQueryExists) {
		// submitting form for track object response
		$.post(
			"/search",
			$("#track-search-form").serialize(),
			(response) => {
				Object.keys(track_ids).forEach((track) => delete track_ids[track]);
				track_objs = {};

				for (let searchresultlist of searchlist) {
					add_tracks_to_card(searchresultlist);
				}

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
});

// returns true if any inputs have values
function searchQueryExists() {
	let notempty = false;

	for (let i = 1; i < 5; i++) {
		if ($(`#track_${i}_name`).val() != "") {
			return true;
		}
	}

	return false;

	/*
    
	if (allempty) {
		// wait for collapse anim
		setTimeout(() => {
			show_track_lists();
			$("#search-button").prop("disabled", false);
		}, 500);
		return;
	}
    */
}

function gen_url_ids_query() {
	// check if track ids is empty
	let track_cnt = 1;
	let fullquery = "";

	Object.keys(track_ids).map((boxnum) => {
		fullquery += `track${boxnum[5]}=${track_ids[boxnum]}&`;
		track_cnt++;
	});

	fullquery = fullquery.substring(0, fullquery.length - 1);

	return fullquery;
}

function update_selections_list() {
	$("#album-cover-row").empty();
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
	let new_query = gen_url_ids_query();

	$("#selections-label").text("");
	update_selections_list();

	if (new_query.length === 0) {
		$("#selections-label").text("No tracks selected. ");
		$("#stats-button").addClass("disabled");
		$("#stats-button").attr("href", `/stats/`);
		return;
	} else {
		$("#selections-label").text("Selections: ");
		$("#stats-button").removeClass("disabled");
		$("#stats-button").attr("href", `/stats/?${new_query}`);
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

// also adds to track_obj list
function add_tracks_to_card(tracks_obj) {
	for (result of tracks_obj) {
		let { track_name, track_artists, track_album, track_id, search_box_num } =
			result;

		track_objs[track_id] = result;

		let cardlist = `card-${search_box_num}-list`;

		let names = [];
		for (let artist of track_artists) {
			names.push(artist.name);
		}

		let album_artists = names.join(", ");
		$(`#${cardlist}`).append(
			`<div class="track-option" data-song-id=${track_id}><h5 class="card-title">${track_name}</h5><h6 class="card-subtitle mb-2 text-muted">${track_name}</h6><h6 class="card-subtitle mb-2 text-muted">${album_artists}</h6></div>`
		);
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
