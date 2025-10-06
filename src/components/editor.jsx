import { useState } from 'react';
import { TableDialog } from '@/components/TableDialog';
import { Table } from 'lucide-react';

export default function editor() {
  const [isTableDialogOpen, setIsTableDialogOpen] = useState(false);

  const handleInsertTable = (tableHTML) => {
    // Insert into your editor
   
    // Or if using a ref-based editor:
     editor.current.innerHTML += tableHTML;
  };

  return (
    <div>
      {/* Your toolbar */}
      <button onClick={() => setIsTableDialogOpen(true)}>
        <Table className="w-4 h-4" />
        Insert Table
      </button>

      {/* Table Dialog */}
      <TableDialog
        isOpen={isTableDialogOpen}
        onClose={() => setIsTableDialogOpen(false)}
        onInsert={handleInsertTable}
      />

      {/* Your editor content */}
      <div contentEditable="true" className="editor">
        {/* Editor content here */}
      </div>
    </div>
  );
}