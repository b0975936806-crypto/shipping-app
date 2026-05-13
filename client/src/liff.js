import liff from '@line/liff';

export const initLiff = async () => {
  try {
    const liffId = '2009886016';
    await liff.init({ liffId });
    
    if (!liff.isInClient()) {
      console.info('App is not running inside LIFF client (running in external browser)');
    } else {
      console.info('LIFF initialized successfully inside LINE client');
    }
  } catch (error) {
    console.warn('LIFF initialization failed', error.message);
  }
};

export default liff;
