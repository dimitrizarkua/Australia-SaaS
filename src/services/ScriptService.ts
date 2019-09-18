const body = document.querySelector('body') as HTMLElement;
const BEACON_SCRIPT_ID = 'beacon-script';

export function injectBeaconScript() {
  if (document.querySelector(`#${BEACON_SCRIPT_ID}`)) {
    return;
  }

  try {
    const initSource = `window.Beacon('init', '${process.env.REACT_APP_BEACON_ID}')`;
    const initScript = document.createElement('script');
    initScript.textContent = initSource;
    initScript.type = 'text/javascript';
    initScript.id = BEACON_SCRIPT_ID;
    const sourceScript = document.createElement('script');
    sourceScript.src = '/beacon.js';
    body.appendChild(sourceScript);
    sourceScript.onload = () => {
      body.appendChild(initScript);
    };
  } catch (e) {
    throw new Error('Beacon error');
  }
}
