import ky from 'ky';

async function fetchSingleCollection(address) {
  try {
    return await ky
      .get(`http://localhost:3001/collections/${address}`, {
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
    return await ky.post(`http://localhost:3001/collections`, {
      json: obj,
      headers: { contentType: 'application/json' },
    });
  } catch (error) {
    console.error('ERROR in createRankedCollection', error);
    return error;
  }
}

export { fetchSingleCollection, createRankedCollection };
