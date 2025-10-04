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
  let currentLevel = 0;
  const pageStack: Array<{ page: Omit<Page, 'id' | 'createdAt' | 'updatedAt' | 'order'>, level: number, tempId: string }> = [];
  const idMap = new Map<string, string>();
  
  for (const line of lines) {
    // Check if line is a heading (starts with # after optional indentation)
    const match = line.match(/^(\s*)# (.+)$/);
    
    if (match) {
      // Save previous page
      if (currentPage) {
        currentPage.content = contentLines.join('\n').trim();
        pages.push(currentPage);
      }
      
      // Calculate indentation level (2 spaces = 1 level)
      const indentation = match[1].length;
      const level = Math.floor(indentation / 2);
      const title = match[2].trim();
      
      // Generate temporary ID for this page
      const tempId = crypto.randomUUID();
      
      // Find parent based on level
      let parentTempId: string | null = null;
      if (level > 0) {
        // Find the most recent page at level - 1
        for (let i = pageStack.length - 1; i >= 0; i--) {
          if (pageStack[i].level === level - 1) {
            parentTempId = pageStack[i].tempId;
            break;
          }
        }
      }
      
      currentPage = {
        title,
        content: '',
        parentId: null, // Will be set later
      };
      
      contentLines = [];
      currentLevel = level;
      
      // Store page with its level and temp ID
      pageStack.push({ page: currentPage, level, tempId });
      idMap.set(tempId, parentTempId || 'null');
    } else if (currentPage) {
      contentLines.push(line);
    }
  }
  
  // Save last page
  if (currentPage) {
    currentPage.content = contentLines.join('\n').trim();
    pages.push(currentPage);
  }
  
  // Now assign parent IDs - we need to do a second pass after pages have real IDs
  // For now, we'll use a marker system that will be resolved by the calling code
  for (let i = 0; i < pages.length; i++) {
    const stackEntry = pageStack[i];
    if (stackEntry.level > 0) {
      // Find parent index
      const parentTempId = idMap.get(stackEntry.tempId);
      if (parentTempId && parentTempId !== 'null') {
        const parentIndex = pageStack.findIndex(p => p.tempId === parentTempId);
        if (parentIndex >= 0) {
          // Store parent index as a marker (will be converted to real ID by caller)
          (pages[i] as any).__parentIndex = parentIndex;
        }
      }
    }
  }
  
  return pages;
};
