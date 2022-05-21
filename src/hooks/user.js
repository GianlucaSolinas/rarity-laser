import React, { useContext, useState, useEffect } from 'react';
// import { getUser } from '../utils/api';
const getUser = () => {
  return {};
};

export const SUBSCRIBER_ROLES = ['SUBSCRIBER', 'MEMBER', 'ADMIN'];
export const FOUNDER_ROLES = ['MEMBER', 'ADMIN'];

const userContext = React.createContext(null);
export const useUser = () => {
  return useContext(userContext);
};

export const UserProvider = ({
  children,
  allowNullUser = false,
  loadFromBackgroundScript = false,
}) => {
  // const { Provider } = userContext;
  const [user, setUser] = useState(null);

  useEffect(() => {
    (async () => {
      const user = (() => {
        if (loadFromBackgroundScript) {
          return (resolve) => {
            chrome.runtime.sendMessage({ method: 'getUser' }, (user) =>
              resolve(user)
            );
          };
        }
        return getUser();
      })();
      const role = user.role || 'FREE';
      const membershipType = user.membershipType || null;

      setUser({
        isSubscriber: isSubscriber(role),
        isFounder: isFounder(role, membershipType),
        role,
        membershipType: membershipType,
      });
    })();
  }, [loadFromBackgroundScript]);

  if (!user && !allowNullUser) return null;

  return children;
};

export const isSubscriber = (role) => Boolean(SUBSCRIBER_ROLES.includes(role));

export const isFounder = (role, membershipType) =>
  FOUNDER_ROLES.includes(role) && membershipType === 'FOUNDER';
