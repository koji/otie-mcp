import { DocumentationSearchEngine } from '../src/qmd/search';

describe('DocumentationSearchEngine', () => {
  let engine: DocumentationSearchEngine;

  beforeEach(() => {
    engine = new DocumentationSearchEngine();
  });

  test('should build search index and return non-empty sections', () => {
    const sections = engine.buildIndex();
    expect(sections.length).toBeGreaterThan(0);
  });

  test('should search for temperature module', () => {
    const results = engine.search('temperature module');
    expect(results.length).toBeGreaterThan(0);
    const topResultText = (results[0].section + ' ' + results[0].content).toLowerCase();
    expect(topResultText).toContain('temperature');
  });

  test('should search for HTTP API protocols endpoint', () => {
    const results = engine.search('protocols');
    expect(results.length).toBeGreaterThan(0);
  });
});
