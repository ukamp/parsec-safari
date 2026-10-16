import {readdirSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
const directory=new URL('../_site/app/',import.meta.url);
const assets=readdirSync(directory).find(name=>name.startsWith('assets-'));
if(!assets)throw Error('Build the app before running tests');
export const asset=path=>new URL(assets+'/'+path,directory).href;
