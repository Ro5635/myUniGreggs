const fs = require('fs');
const util = require('util');
const fetch = require('node-fetch');

const readFile = util.promisify(fs.readFile);
const googleMapsAPIKey = 'AIzaSyAQmXN-29_lMunWTvsI-5hY5WbCKNhF63M';
const rawUniData = './uncleaned_uni_list.json';

const getUniversitiesFromFile = async () => {
    try {
        const contents = await readFile(rawUniData, 'utf8');
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

const getPlaceIdFromName = async ({placeName}) => {
    try {
        const encodedPlaceName = encodeURIComponent(placeName);
        const findPlaceFromTextURL = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?key=${googleMapsAPIKey}&input=${encodedPlaceName}&inputtype=textquery`;
        const placesFromTextResponse = await fetch(findPlaceFromTextURL);
        const placesFromTextResponseJson = await placesFromTextResponse.json();

        const candidates = placesFromTextResponseJson.candidates;
        return candidates.map(candidate => {
            return candidate.place_id
        });
    } catch (error) {
        console.log(error);
    }
};

const getLocation = async ({placeId}) => {
    try {
        const getPlaceByPlaceIdURL = `https://maps.googleapis.com/maps/api/place/details/json?key=${googleMapsAPIKey}&place_id=${placeId}`;
        const getPlaceByPlaceIdResponse = await fetch(getPlaceByPlaceIdURL);
        const getPlaceByPlaceIdResponseJson = await getPlaceByPlaceIdResponse.json();

        return getPlaceByPlaceIdResponseJson.result.geometry.location;
    } catch (error) {
        console.log(error);
    }
};

const runable = async () => {

    let universitys = await getUniversitiesFromFile();

    for (university of universitys) {
        console.log(university);
    }
    // const matchingPlaceIds = await getPlaceIdFromName({placeName: 'Aston University'});
    // // Assume that the 0th index is the closest match...
    // const location = await getLocation({placeId: matchingPlaceIds[0]});
    // console.log(location);
};

runable();