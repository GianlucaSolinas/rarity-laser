import DataLoader from 'dataloader';

const chainMapNames = {
  ethereum: 'eth',
};

const getAssetProps = (asset, type) => {
  const assetlink = asset.getAttribute('href');

  const [chain, address, token_id] = assetlink.split('/').slice(-3);

  return {
    chain: chainMapNames[chain],
    address,
    token_id,
  };
};

const openseaCollectionLoader = new DataLoader(async (slugs) => {
  return await Promise.all(
    slugs.map(async (currslug) => {
      if (currslug === null) return null;

      const { collection } = await (
        await fetch(`https://api.opensea.io/api/v1/collection/${currslug}`)
      ).json();

      return collection;
    })
  );
});

const fetchOpenSeaCollection = async (slug) => {
  return openseaCollectionLoader.load(slug);
};

const getOpenseaCollection = async (collectionSlug) => {
  if (collectionSlug === null) return null;

  const { collection } = await (
    await fetch(`https://api.opensea.io/api/v1/collection/${collectionSlug}`)
  ).json();

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
