/*
    Like with albumDisplay, we make use of an onChange handler
    to get which values are selected.

    Then we just make a button that leads to the stats
    page with our track IDs as the query
*/
const displayStatsButton = () => {
    $(".form-check-input").change(updateStatsLink);
    $("#stats-button-container").append(baseButton);

    function updateStatsLink() {
        const button = $("#stats-button");
        // remove prior link, make it disabled
        button.removeProp("href").addClass("disabled");

        // select the radios that are checked and get their IDs,
        // then build the stats link with them
        const selectedRadios = $('.form-check-input:checked');
        if (selectedRadios.length > 0) {
            const selectedIds = selectedRadios.get().map(
                (radioElem) => radioElem.dataset.songId
            );

            // add all the track Ids with URI query syntax,
            // then remove the trailing & w/slice
            const statsQuery = selectedIds.reduce(
                (partialQuery, trackId, index) => partialQuery + `track${index + 1}=${trackId}&`,
                "/stats?"
            ).slice(0, -1);

            button.html("Visualize").prop("href", statsQuery).removeClass("disabled");
        }
    }
}

const baseButton = `
    <a
        id="stats-button"
        class="btn btn-success disabled"
        role="button"
    >
      No Tracks Selected
    </a>
`;

/*
    add individual logic for each thing to remove
    to reset button
*/
$("#reset-button").click(() => {
    $("#stats-button").remove();
});