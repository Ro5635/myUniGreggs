const geolib = require('geolib');
const fs = require('fs');
const util = require('util');
const fetch = require('node-fetch');
const readFile = util.promisify(fs.readFile);
const cleanUniData = '../universities-cleaned.json';
const cleanGreggsFile = '../greggs.json';
const radius = 5000; // 5km
const propietarySugar = 100; // magic number baby


// 1 - Get the list of greggs
const getUniversitiesFromFile = async () => {
    try {
        const contents = await readFile(cleanUniData, 'utf8');
        const rawUniversityFileRead = JSON.parse(contents);
        const universityIndexedByName = Object.keys(rawUniversityFileRead);

        let universities = [];
        for (const university of universityIndexedByName) {
            universities.push({university, ...rawUniversityFileRead[university]});
        }
        return universities;

    } catch (error) {
        console.log(error);
        console.log('Failed to read universities from file');
    }
};

const getGreggsFromFile = async () => {
    try {
        const contents = await readFile(cleanGreggsFile, 'utf8');
        const rawGreggsFileRead = JSON.parse(contents);
        return rawGreggsFileRead;
        // console.log(rawGreggsFileRead)
    } catch (error) {
        console.log(error);
        console.log('Failed to read greggs from file');
    }

};

const run = async () => {
    const universities = await getUniversitiesFromFile();
    const newUniversities = [];
    const greggs = await getGreggsFromFile();

    // clean up unis list to remove unis with an unknown number of students
    const validatedUniversities = universities.filter(university => university.university["Number of students"].length > 1);

    validatedUniversities.forEach(university => {
        newUniversities.push({
            name: university.university.university,
            numStudents: Number(university.university["Number of students"].replace(/,/g, '')),
            latitude: university.university.location.lat,
            longitude: university.university.location.lng,
        })
    })


    newUniversities.forEach(university => {
        let numGreggsInViscinity = 0;
        greggs.forEach(gregg => {
            // console.log("your gregg is: " + JSON.stringify(gregg))
            // console.log("your uni is: " + JSON.stringify(university))
            
            geolib.isPointWithinRadius(
                { latitude: university.latitude, longitude: university.longitude },
                { latitude: gregg.latitude, longitude: gregg.longitude },
                radius
            ) ? numGreggsInViscinity++ : null;
        })
        university.numGreggsInViscinity = numGreggsInViscinity;
        university.greggsDensity = (numGreggsInViscinity / university.numStudents) * propietarySugar;
    })

    // Dump this to a file
    

    console.log(newUniversities);

    // For each university
    // ... for each greggs
    // ... ... is the greggs in isPointWithinRadius?
    // ... ... ... yes?
    // ... ... ... increment this university's count

    // when that's done, add a "density"
}

run();
