import { Box, Button } from '@mui/material';
import React, { useEffect } from 'react';
import Moralis from 'moralis';
import { useMoralis } from 'react-moralis';
import createMetaMaskProvider from 'metamask-extension-provider';
import { LoginOutlined } from '@mui/icons-material';

class customConnector extends Moralis.AbstractWeb3Connector {
  async activate() {
    const provider = createMetaMaskProvider();
    if (!provider) {
      console.error('MetaMask provider not detected.');
      throw new Error('MetaMask provider not detected.');
    }
    const [accounts, chainId] = await Promise.all([
      provider.request({
        method: 'eth_requestAccounts',
      }),
      provider.request({ method: 'eth_chainId' }),
    ]);
    const account = accounts[0] ? accounts[0].toLowerCase() : null;

    this.chainId = provider.chainId;
    this.account = provider.selectedAddress;
    this.provider = provider;

    this.subscribeToEvents(provider);

    return { provider, chainId, account };
  }
}

const AuthStatus = () => {
  const {
    authenticate,
    isAuthenticated,
    isAuthenticating,
    user,
    account,
    logout,
  } = useMoralis();

  useEffect(() => {
    if (isAuthenticated) {
      // add your logic here
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const loginWithMetamask = async () => {
    if (!isAuthenticated) {
      await authenticate({
        connector: customConnector,
        signingMessage: 'Log in using Moralis',
      })
        .then(function (user) {
          console.log('logged in user:', user);
          console.log(user.get('ethAddress'));
        })
        .catch(function (error) {
          console.log(error);
        });
    }
  };

  const logOut = async () => {
    await logout();
    console.log('logged out');
  };

  return (
    <Box mb={2} style={{ color: 'white' }}>
      {user ? (
        <div>
          User logged in - <Button onClick={logOut}>Logout</Button>
        </div>
      ) : (
        <Button
          variant="contained"
          startIcon={<LoginOutlined />}
          onClick={loginWithMetamask}
        >
          Login with Metamask
        </Button>
      )}
    </Box>
  );
};

export default AuthStatus;
