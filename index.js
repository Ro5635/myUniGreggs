/**
 * Hacky Script to rip two data sources together
 *
 */
const fs = require('fs');
const util = require('util');
const fetch = require('node-fetch');
// import Bottleneck from "bottleneck";
const Bottleneck = require("bottleneck");

const readFile = util.promisify(fs.readFile);
const googleMapsAPIKey = process.env.googelMapsAPIKey;
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

        console.log(getPlaceByPlaceIdResponseJson);

        return getPlaceByPlaceIdResponseJson.result.geometry.location;
    } catch (error) {
        console.log(error);
    }
};

const runable = async () => {
    let universitys = await getUniversitiesFromFile();

    const limiter = new Bottleneck({
        maxConcurrent: 1,
        minTime: 1500
    });

    const getLocation_Limited = limiter.wrap(getLocation);
    const getPlaceIdFromName_Limited = limiter.wrap(getPlaceIdFromName);
    const timestamp = Date.now();
    const fileName = `universities-${timestamp}.json`;
    const stream = fs.createWriteStream(fileName);

    stream.once('open', async () => {
        stream.write(`[`);
        for (university of universitys) {
            console.log(`Normalising: ${university.university}`);
            const matchingPlaceIds = await getPlaceIdFromName_Limited({placeName: university.university});

            // Assume that the 0th index is the closest match...
            university.location = await getLocation_Limited({placeId: matchingPlaceIds[0]});
            console.log(`Complected University ${university.university}`);

            stream.write(`${JSON.stringify({university})},`);
        }
        stream.write(`]`);
        stream.end();
        console.log('FINISHED!');
    });
};

runable();