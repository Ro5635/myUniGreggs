const fs = require('fs');

fs.readFile('./greggs.json', 'utf8', function(err, contents) {
    console.log(contents);

});
