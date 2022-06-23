import ky from 'ky';

const API_URL = 'https://spy-volcano-api.herokuapp.com';

async function fetchSingleCollection(address) {
  try {
    return await ky
      .get(`${API_URL}/collections/${address}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .json();
  } catch (error) {
    return null;
  }
}

async function createRankedCollection(obj) {
  console.log('crate ranked', obj);
  try {
    return await ky.post(`${API_URL}/collections`, {
      json: obj,
      headers: { contentType: 'application/json' },
    });
  } catch (error) {
    console.error('ERROR in createRankedCollection', error);
    return error;
  }
}

export { fetchSingleCollection, createRankedCollection };
