import { DocumentationSearchEngine } from './search.js';

console.log('Building Opentrons documentation search index...');
const engine = new DocumentationSearchEngine();
const sections = engine.buildIndex();
console.log(`Successfully indexed ${sections.length} document sections into docs/index.json.`);
