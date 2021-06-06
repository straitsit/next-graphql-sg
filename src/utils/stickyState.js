import { useEffect, useState } from 'react';

const isServer = () => typeof window === 'undefined';

function useStickyStateBase(defaultValue, key) {
    let stickyValue = defaultValue;
  
    if (!isServer() && localStorage.getItem(key) !== null) {
      stickyValue = JSON.parse(localStorage.getItem(key));
    }
  
    const [value, setValue] = useState(stickyValue);
  
    useEffect(() => {
      localStorage.setItem(key, JSON.stringify(value));
    }, [key, value]);
  
    return [value, setValue];
  }
  
function useStickyState(defaultValue, key, lsexp, setLsexp) {
    const now = new Date();
    const ttl = now.getTime() - lsexp; // set to 3600000 one hour
  
    let stickyValue = defaultValue;
    if (!isServer() && localStorage.getItem(key) !== null && ttl < 3600000) {
      stickyValue = JSON.parse(localStorage.getItem(key));
    }
  
    const [value, setValue] = useState(stickyValue);
  
    useEffect(() => {
      localStorage.setItem(key, JSON.stringify(value));
      setLsexp(now.getTime());
    }, [key, value]);
  
    return [value, setValue];
  }

export {useStickyState, useStickyStateBase};