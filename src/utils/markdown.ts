import { Page } from '@/services/storage';

export const exportToMarkdown = (pages: Page[]): string => {
  const sortedPages = [...pages].sort((a, b) => a.order - b.order);
  
  const buildPageTree = (parentId: string | null, level: number = 0): string => {
    const children = sortedPages.filter(p => p.parentId === parentId);
    let markdown = '';
    
    for (const page of children) {
      const indent = '  '.repeat(level);
      markdown += `${indent}# ${page.title}\n\n`;
      markdown += `${indent}${page.content}\n\n`;
      markdown += buildPageTree(page.id, level + 1);
    }
    
    return markdown;
  };
  
  return buildPageTree(null);
};

export const downloadMarkdown = (content: string, filename: string = 'notes.md') => {
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const parseMarkdownImport = (content: string): Omit<Page, 'id' | 'createdAt' | 'updatedAt' | 'order'>[] => {
  const pages: Omit<Page, 'id' | 'createdAt' | 'updatedAt' | 'order'>[] = [];
  const lines = content.split('\n');
  
  let currentPage: Omit<Page, 'id' | 'createdAt' | 'updatedAt' | 'order'> | null = null;
  let contentLines: string[] = [];
  
  for (const line of lines) {
    if (line.startsWith('# ')) {
      if (currentPage) {
        currentPage.content = contentLines.join('\n').trim();
        pages.push(currentPage);
      }
      
      currentPage = {
        title: line.substring(2).trim(),
        content: '',
        parentId: null,
      };
      contentLines = [];
    } else if (currentPage) {
      contentLines.push(line);
    }
  }
  
  if (currentPage) {
    currentPage.content = contentLines.join('\n').trim();
    pages.push(currentPage);
  }
  
  return pages;
};
