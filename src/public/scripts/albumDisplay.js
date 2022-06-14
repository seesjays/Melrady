/*
    Responsible for adding the album art
    to the results display.
    An onChange handler is added to every radio element (this 
        function should be called after search results are 
        added to track selection form)
    The handler removes all of the album cvers and repopulates the
    display section with the art for the selected tracks.
*/
const initializeAlbumDisplay = (results) => {
    $(".form-check-input").change(updateAlbumGrid);

    // also serves as the onclick func
    function updateAlbumGrid() {
        // remove all previous album art
        $("#cover-art-container").empty();

        // select the radios that are checked and get their IDs, then make the album
        // art grid based off those
        const selectedRadios = $('.form-check-input:checked');
        if (selectedRadios.length > 0) {
            const selectedIds = selectedRadios.get().map(
                (radioElem) => radioElem.dataset.songId
            );
            const maxSize = (selectedIds.length <= 1) ? 12 : 6;

            const albumGrid = results.map((trackObjArray) => {
                const covers = trackObjArray
                    .filter(track => selectedIds.includes(track.trackData.trackId))
                    .map((track) => albumElement(track, maxSize));

                return covers;
            });

            $("#cover-art-container").append(albumGrid);
        }
    }


    function albumElement(trackObject, size) {
        return `
        <a class="col-${size} link-dark" href=${trackObject.trackData.trackURL}>
            <img
              src="${trackObject.trackData.albumArt}"
              class="album-cover img-fluid"
            />
            <p style="text-align: center">${trackObject.trackData.trackName}</p>
        </a>
        `;
    }
}

/*
	add individual logic for each thing to remove
	to reset button
*/
$("#reset-button").click(() => {
	$("#cover-art-container").empty();
});