import fs from 'fs';
import path from 'path';

export interface SearchResult {
  file: string;
  section: string;
  content: string;
  score: number;
}

export interface DocSection {
  file: string;
  section: string;
  content: string;
}

export class DocumentationSearchEngine {
  private docsDir: string;
  private indexPath: string;
  private sections: DocSection[] = [];

  constructor(docsDir?: string, indexPath?: string) {
    this.docsDir = docsDir || path.resolve(process.cwd(), 'docs');
    this.indexPath = indexPath || path.resolve(process.cwd(), 'docs', 'index.json');
    this.loadOrBuildIndex();
  }

  public loadOrBuildIndex(): void {
    if (fs.existsSync(this.indexPath)) {
      try {
        const raw = fs.readFileSync(this.indexPath, 'utf-8');
        this.sections = JSON.parse(raw);
        return;
      } catch {
        // Fallback to building index
      }
    }
    this.buildIndex();
  }

  public buildIndex(): DocSection[] {
    this.sections = [];
    if (!fs.existsSync(this.docsDir)) {
      return this.sections;
    }

    const files = fs.readdirSync(this.docsDir).filter((f) => f.endsWith('.md'));

    for (const file of files) {
      const filePath = path.join(this.docsDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const parsedSections = this.parseMarkdownSections(file, fileContent);
      this.sections.push(...parsedSections);
    }

    try {
      fs.writeFileSync(this.indexPath, JSON.stringify(this.sections, null, 2), 'utf-8');
    } catch {
      // Ignore write errors if directory is read-only
    }

    return this.sections;
  }

  private parseMarkdownSections(file: string, markdown: string): DocSection[] {
    const lines = markdown.split('\n');
    const sections: DocSection[] = [];
    let currentSection = 'Overview';
    let currentLines: string[] = [];

    for (const line of lines) {
      if (line.startsWith('#')) {
        if (currentLines.length > 0) {
          sections.push({
            file,
            section: currentSection,
            content: currentLines.join('\n').trim(),
          });
          currentLines = [];
        }
        currentSection = line.replace(/^#+\s*/, '').trim();
      } else {
        currentLines.push(line);
      }
    }

    if (currentLines.length > 0) {
      sections.push({
        file,
        section: currentSection,
        content: currentLines.join('\n').trim(),
      });
    }

    return sections;
  }

  public search(query: string, maxResults: number = 5): SearchResult[] {
    if (this.sections.length === 0) {
      this.loadOrBuildIndex();
    }

    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (terms.length === 0) return [];

    const results: SearchResult[] = [];

    for (const item of this.sections) {
      const sectionLower = item.section.toLowerCase();
      const contentLower = item.content.toLowerCase();
      const fileLower = item.file.toLowerCase();
      let score = 0;

      for (const term of terms) {
        if (sectionLower.includes(term)) {
          score += 10;
        }
        if (fileLower.includes(term)) {
          score += 5;
        }
        const matches = (contentLower.match(new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
        score += matches;
      }

      if (score > 0) {
        results.push({
          file: item.file,
          section: item.section,
          content: item.content,
          score,
        });
      }
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, maxResults);
  }
}
