import { existsSync, unlinkSync } from 'node:fs';

// Laravel prioritizes this marker over the production manifest. It can be
// left behind after running `npm run dev`, so remove it before every build.
const hotFile = new URL('../public/hot', import.meta.url);

if (existsSync(hotFile)) {
    unlinkSync(hotFile);
    console.log('Removed stale public/hot; Laravel will use the production build.');
}
