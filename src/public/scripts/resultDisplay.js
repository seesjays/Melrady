/*
	responsible for placing the formSubmit
	results into their proper cards 
	and adding them to the DOM
*/
const displayResults = (results) => {
	const resultCards = results.map((trackObjArray, groupInd) => {
		const radios = trackObjArray.map((track, index) => radioElement(track, groupInd + 1, index));
		const cards = trackSelectionCard(radios, groupInd + 1);
		return cards;
	}).join('\n');

	// used to be cards being placed in a form, now I realize that an empty form might be inaccessible.
	const resultForm = `
		<h2 id="results-label" class="result-form-element" style="font-size: calc(1.275rem + 0.3vw); margin-top: 1em">
    	    Select the correct tracks:
    	</h2>
		<form id="track-selection-form" class="col-sm-8 result-form-element">
			${resultCards}
		</form>
	`;

	$("#results").prepend(resultForm);


	/*
		-- helper funcs --
		I really like this new form - composing the elements in chunks instead of appending
		parts to other parts of elements messily in JQuery. It's so much easier to work
		with, and the code is much more readable.
	*/

	// This takes an array of singular radio elements (see below) and groups them into a card.
	function trackSelectionCard(radioElements, groupNum) {
		return `
			<div class="card" style="width: 100%; margin-bottom: 1em;">
				<div class="card-header">
					Track ${groupNum}
				</div>
				<div class="card-body">
					${radioElements.reduce((prev, curr, ind) => prev + `\n` + curr)}
				</div>
			</div>
		`;
	};

	// This should create a singular clickable radio element.
	// The reason I split this out is because I'll likely add an onCLick listener
	// for the album art updating func. Also, it just makes sense split out as a single element.
	function radioElement(trackObject, groupNum, trackNum) {
		const artists = trackObject.trackData.trackArtists
			.map(artist => artist.name)
			.join(", ");

		return `
			<div class="form-check">
				<input
					class="form-check-input"
					type="radio"
					name="track-selection-${groupNum}"
					id="track-group-${groupNum}-radio-${trackNum}"
					data-song-id=${trackObject.trackData.trackId}
				/>
				<label class="form-check-label" for="track-group-${groupNum}-radio-${trackNum}">
					<div class="track-option" data-song-id="${trackObject.trackData.trackId}">
					    <h5 class="card-title">
							${trackObject.trackData.trackName}
						</h5>
					    <h6 class="card-subtitle mb-2 text-muted">
							${trackObject.trackData.albumName}
						</h6>
					    <h6 class="card-subtitle mb-2 text-muted">
							${artists}
						</h6>
					</div>
				</label>
			</div>
		`;
	}
}

/*
	add individual logic for each thing to remove
	to reset button
*/
$("#reset-button").click(() => {
	$(".result-form-element").remove();
});