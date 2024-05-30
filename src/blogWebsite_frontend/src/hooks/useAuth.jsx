import React, { useEffect, useState } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
 import {canisterId, idlFactory} from "../../../declarations/backend"
import { Principal } from '@dfinity/principal';
import { createActor } from "../utils/createActor"
import { createAgent } from '@dfinity/utils';

const IdentityHost =
  process.env.DFX_NETWORK === 'ic'
    ? 'https://identity.ic0.app/#authorize'
    : `http://localhost:4944?canisterId=${process.env.CANISTER_ID_INTERNET_IDENTITY}#authorize`;
//One day in nanoseconds

const HOST =
  process.env.DFX_NETWORK === 'ic'
    ? 'https://identity.ic0.app/#authorize'
    : 'http://localhost:4944';

const days = BigInt(1);
const hours = BigInt(24);
const nanoseconds = BigInt(3600000000000);

const defaultOptions = {
  createOptions: {
    idleOptions: {
      // Set to true if you do not want idle functionality
      disableIdle: true,
    },
  },
  loginOptions: {
    identityProvider: IdentityHost,
    // Maximum authorization expiration is 8 days
    maxTimeToLive: days * hours * nanoseconds,
  },
};

const useAuth = () => {

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [buttonLoading, setButtonLoading] = useState(false);

  const handleLogin = async () => {
    setButtonLoading(true);
    try {
      const authClient = await AuthClient.create(defaultOptions.createOptions);

      if (await authClient.isAuthenticated()) {
        console.log(await authClient.isAuthenticated());
        //handleAuthentication
        handleAuthenticated(authClient);
      } else {
        //login
        await authClient.login({
          identityProvider: IdentityHost,
          onSuccess: () => {
            handleAuthenticated(authClient);
          },
        });
      }
    } catch (error) {
      console.log('error in login:', error);
    }
  }


  async function handleAuthenticated(authClient) {
    //get the identity
    if (!(await authClient?.isAuthenticated())) {
      navigate('/');
      return;
    }
    console.log('authclient :', authClient);
    const identity = authClient.getIdentity();

    //get the principal id
    const principal = identity.getPrincipal();

    const agent = await createAgent({
      identity,
      host: HOST,
    });

    const backendActor = createActor(canisterId, idlFactory, { agent });

    const postsByUser = await backendActor?.get_all_posts()
    let userProfile = await backendActor.get_user_profile(principal)

    console.log("all posts by user :",postsByUser,userProfile)
    
    await queryClient.setQueryData(['userPosts'], postsByUser);
    await queryClient.setQueryData(['userProfile'], userProfile);


    await queryClient.setQueryData(['backendActor'], backendActor);
    await queryClient.setQueryData(['identity'], identity);
    await queryClient.setQueryData(
      ['isUserAuthenticated'],
      await authClient?.isAuthenticated(),
    );
    await queryClient.setQueryData(['principal'], principal?.toString());
    
    setButtonLoading(false);
    navigate('/dashboard');
  }

    const LoginButton = () => {
    return (
      <button className='border p-3 bg-red-500 text-white' onClick={handleLogin}>
        Login
      </button>
    )
  }
  const LogoutButton = () => {
    return (
      <button onClick={logout} >
        logout
      </button>
    )
  }

  const logout = async () => {
    const authClient = await AuthClient.create(defaultOptions.createOptions);

    await authClient?.logout();
    await queryClient.setQueryData(['agent'], null);

    await queryClient.setQueryData(['backendActor'], null);
    await queryClient.setQueryData(['identity'], null);
    await queryClient.setQueryData(
      ['isUserAuthenticated'],
      await authClient?.isAuthenticated(),
    );
        handleAuthenticated(authClient);
  }





  return {
    LoginButton,
    LogoutButton
  }
}

export default useAuth