'use client';

import Clarity from '@microsoft/clarity';
import { useEffect } from 'react';

const clarityEnv = process.env.NEXT_PUBLIC_CLARITY_API_KEY;

const MicrosoftClarity = () => {
  useEffect(() => {
    console.log(clarityEnv)
    if (!clarityEnv) return;

    try{
      console.log('Initializing',clarityEnv)
      Clarity?.init(clarityEnv);
    } catch(err) {
      console.error(err)
    }
  }, []);

  return null;
};

export default MicrosoftClarity;