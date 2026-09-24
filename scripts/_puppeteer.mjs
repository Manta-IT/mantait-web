// puppeteer-core zije v tools/axe (npm ci tamtez), web/ je vlastni repo bez node_modules
import { createRequire } from 'node:module';
const require = createRequire(new URL('../../tools/axe/package.json', import.meta.url));
export default require('puppeteer-core');
