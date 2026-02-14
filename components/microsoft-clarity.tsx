'use client';

import Clarity from '@microsoft/clarity';
import { useEffect } from 'react';

const clarityEnv = process.env.NEXT_PUBLIC_CLARITY_API_KEY;

const MicrosoftClarity = () => {
  useEffect(() => {
    if (!clarityEnv) return;

    Clarity?.init(clarityEnv);
  }, []);

  return null;
};

export default MicrosoftClarity;