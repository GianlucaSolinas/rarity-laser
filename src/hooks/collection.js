import DataLoader from 'dataloader';
import ky from 'ky';

const chainMapNames = {
  ethereum: 'eth',
};

const getPropsFromLink = (link, type) => {
  switch (type) {
    case 'list_item':
      return link
        .split('/')
        .filter((e) => e.length)
        .slice(-3);

    case 'card_item':
    default:
      return link.split('/').slice(-3);
  }
};

const getAssetProps = (asset, type) => {
  const assetlink = asset.getAttribute('href');
  let price = null;

  const priceContainer = asset.querySelector('.Price--main');

  if (priceContainer) {
    price = priceContainer.querySelector('.Price--amount').innerText;
  }

  const [chain, address, token_id] = getPropsFromLink(assetlink, type);

  return {
    chain: chainMapNames[chain],
    address,
    token_id,
    price,
  };
};

const openseaCollectionLoader = new DataLoader(async (slugs) => {
  return await Promise.all(
    slugs.map(async (currslug) => {
      if (currslug === null) return null;

      const { collection } = await ky
        .get(`https://api.opensea.io/api/v1/collection/${currslug}`)
        .json();

      return collection;
    })
  );
});

const fetchOpenSeaCollection = async (slug) => {
  return openseaCollectionLoader.load(slug);
};

const getOpenseaCollection = async (collectionSlug) => {
  if (collectionSlug === null) return null;

  const { collection } = await ky
    .get(`https://api.opensea.io/api/v1/collection/${collectionSlug}`)
    .json();

  return collection;
};

const getEtherscanAddress = async () => {
  let elem = document.querySelector("a[href^='https://etherscan.io/address']");
  if (elem) {
    const path = elem.href.split('/');
    return path.pop();
  } else {
    return null;
  }
};

export {
  getAssetProps,
  getOpenseaCollection,
  getEtherscanAddress,
  fetchOpenSeaCollection,
};
