$( document ).ready(function() {
    $.getJSON( "../cleanup_data/high_value_data.json", function( json ) {
        // dump json to leaderboard
        const data = json;
        const sortedData = data.sort((gregg1, gregg2) => gregg1.greggsDensity > gregg2.greggsDensity ? -1 : 1)
        const leaderboard = document.getElementById("leaderboard");

        let counter = 0;
        sortedData.forEach(item => {

            if(item.numStudents > 0){
                counter++;
                console.log(counter, item)

                leaderboard.insertAdjacentHTML("beforeend", `<br>${counter} - <strong>${item.name}</strong> - Density of ${item.greggsDensity.toPrecision(4)}<br> with  ${item.numGreggsInViscinity} Greggs stores for ${item.numStudents} students<br/>`);
            }
        });
    });
});
