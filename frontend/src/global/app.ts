import '@ionic/core';
import { setupConfig } from '@ionic/core';
import { LetItGo } from 'let-it-go';

/**
 * The code to be executed should be placed within a default function that is
 * exported by the global script. Ensure all of the code in the global script
 * is wrapped in the function() that is exported.
 */
export default async () => {
  let mode = localStorage.getItem('mode');
  switch (mode) {
    case 'ios':
    case 'md':
      setupConfig({
        mode,
      });
  }

  startSnow();
};

function startSnow() {
  // create snow with some options
  new LetItGo({
    ...LetItGo.DEFAULT_OPTIONS,
    // radius range of snowflake, defaults to `[0.5, 1]`
    radiusRange: [0.75, 1.75],
  });
}
