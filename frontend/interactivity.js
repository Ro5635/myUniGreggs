$( document ).ready(function() {
    initialParse();
});

initialParse = () => {
    $.getJSON( "universities-cleaned.json", function( json ) {
        console.log( json );
       });
    
    console.log(this.map);

}
