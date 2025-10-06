import React, { useState } from 'react';
import { Table, Trash2, ChevronDown, ChevronUp, Copy, Palette, X } from 'lucide-react';

export default function TableEditor() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasHeaderRow, setHasHeaderRow] = useState(true);
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(5);

  const insertTable = () => {
    const headerRow = hasHeaderRow ? `
      <thead>
        <tr class="bg-muted/30">
          ${Array(cols).fill(0).map((_, i) => `
          <th class="border-b border-r border-border p-3 text-left font-medium text-sm hover:bg-muted/50 transition-colors last:border-r-0" contenteditable="true" style="min-width: 150px;">
            Header ${i + 1}
          </th>
          `).join('')}
        </tr>
      </thead>
    ` : '';

    const bodyRows = Array(rows).fill(0).map((_, rowIdx) => `
      <tr class="hover:bg-muted/20 transition-colors">
        ${Array(cols).fill(0).map((_, colIdx) => `
        <td class="border-b border-r border-border p-3 text-sm last:border-r-0" contenteditable="true">
          Cell ${rowIdx * cols + colIdx + 1}
        </td>
        `).join('')}
      </tr>
    `).join('');

    const table = `
      <table class="w-full my-4 border-collapse rounded-lg overflow-hidden" style="border-spacing: 0;">
        ${headerRow}
        <tbody>
          ${bodyRows}
        </tbody>
      </table>
    `;
    
    console.log('Table HTML:', table);
    alert('Table created! Check console for HTML code.');
    setIsOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Trigger Button */}
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
        >
          <Table className="w-4 h-4" />
          Insert Table
        </button>

        {/* Dialog Overlay */}
        {isOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-20 z-50">
            <div className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-md border border-slate-700 animate-in fade-in slide-in-from-top-4 duration-200">
              {/* Header with Search */}
              <div className="px-4 py-3 border-b border-slate-700">
                <input
                  type="text"
                  placeholder="Search actions..."
                  className="w-full bg-slate-700 text-white text-sm px-3 py-2 rounded border border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
                  autoFocus
                />
              </div>

              {/* Menu Items */}
              <div className="py-2 max-h-96 overflow-y-auto">
                {/* Header Row Toggle */}
                <div className="flex items-center justify-between px-4 py-2 hover:bg-slate-700 cursor-pointer group transition-colors">
                  <div className="flex items-center gap-3">
                    <Table className="w-4 h-4 text-slate-400 group-hover:text-slate-300" />
                    <span className="text-sm text-white">Header row</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setHasHeaderRow(!hasHeaderRow);
                    }}
                    className={`relative w-10 h-5 rounded-full transition-colors ${
                      hasHeaderRow ? 'bg-blue-600' : 'bg-slate-600'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                        hasHeaderRow ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                {/* Color */}
                <div className="flex items-center justify-between px-4 py-2 hover:bg-slate-700 cursor-pointer group transition-colors">
                  <div className="flex items-center gap-3">
                    <Palette className="w-4 h-4 text-slate-400 group-hover:text-slate-300" />
                    <span className="text-sm text-white">Color</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-300" />
                </div>

                {/* Insert Above */}
                <div className="flex items-center gap-3 px-4 py-2 hover:bg-slate-700 cursor-pointer group transition-colors">
                  <ChevronUp className="w-4 h-4 text-slate-400 group-hover:text-slate-300" />
                  <span className="text-sm text-white">Insert above</span>
                </div>

                {/* Insert Below */}
                <div className="flex items-center gap-3 px-4 py-2 hover:bg-slate-700 cursor-pointer group transition-colors">
                  <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-300" />
                  <span className="text-sm text-white">Insert below</span>
                </div>

                {/* Duplicate */}
                <div className="flex items-center justify-between px-4 py-2 hover:bg-slate-700 cursor-pointer group transition-colors">
                  <div className="flex items-center gap-3">
                    <Copy className="w-4 h-4 text-slate-400 group-hover:text-slate-300" />
                    <span className="text-sm text-white">Duplicate</span>
                  </div>
                  <span className="text-xs text-slate-500">⌘D</span>
                </div>

                {/* Clear Contents */}
                <div className="flex items-center gap-3 px-4 py-2 hover:bg-slate-700 cursor-pointer group transition-colors">
                  <X className="w-4 h-4 text-slate-400 group-hover:text-slate-300" />
                  <span className="text-sm text-white">Clear contents</span>
                </div>

                {/* Delete */}
                <div className="flex items-center gap-3 px-4 py-2 hover:bg-slate-700 cursor-pointer group transition-colors">
                  <Trash2 className="w-4 h-4 text-red-400 group-hover:text-red-300" />
                  <span className="text-sm text-red-400 group-hover:text-red-300">Delete</span>
                </div>
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-slate-700 bg-slate-800/50">
                <div className="text-xs text-slate-500 mb-3 leading-relaxed">
                  Last edited by Ajay Legion<br />
                  Jul 18, 2025 at 6:29 PM
                </div>
                
                {/* Row and Column Inputs */}
                <div className="flex gap-3 mb-3">
                  <div className="flex-1">
                    <label className="text-xs text-slate-400 block mb-1.5 font-medium">Rows</label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={rows}
                      onChange={(e) => setRows(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                      className="w-full bg-slate-700 text-white text-sm px-3 py-2 rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-slate-400 block mb-1.5 font-medium">Columns</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={cols}
                      onChange={(e) => setCols(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                      className="w-full bg-slate-700 text-white text-sm px-3 py-2 rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={insertTable}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors font-medium"
                  >
                    Insert Table
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preview Area */}
        <div className="mt-8 p-6 bg-slate-800 rounded-lg border border-slate-700">
          <h2 className="text-white text-lg font-semibold mb-4">Table Configuration</h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Rows:</span>
              <span className="text-white font-medium">{rows}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Columns:</span>
              <span className="text-white font-medium">{cols}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Header Row:</span>
              <span className="text-white font-medium">{hasHeaderRow ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>

        {/* Example Table */}
        <div className="mt-8 p-6 bg-slate-800 rounded-lg border border-slate-700">
          <h2 className="text-white text-lg font-semibold mb-4">Example Output</h2>
         
        </div>
      </div>
    </div>
  );
}