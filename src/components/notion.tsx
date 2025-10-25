import { FC } from 'react';

const NotionPage: FC = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Notion Integration</h1>
      <div className="bg-card p-4 rounded-lg">
        {/* Add your Notion content here */}
        <p>Your Notion content will appear here</p>
      </div>
    </div>
  );
};

export default NotionPage;