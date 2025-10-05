import React, { useState } from 'react';

const WorkflowPage = () => {
  const [formData, setFormData] = useState({ user: '' });
  const [isManager, setIsManager] = useState(false);
  const [chatResponse, setChatResponse] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate AI Agent processing
    const response = isManager ? 'Manager workflow initiated' : 'User workflow initiated';
    setChatResponse(response);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Workflow Manager</h1>

      {/* Form Submission */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Create User Form</h2>
        <form onSubmit={handleSubmit} className="mb-4">
          <input
            type="text"
            value={formData.user}
            onChange={(e) => setFormData({ ...formData, user: e.target.value })}
            placeholder="Enter user details..."
            className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <label className="block mt-2">
            <input
              type="checkbox"
              checked={isManager}
              onChange={(e) => setIsManager(e.target.checked)}
              className="mr-2"
            />
            Is Manager?
          </label>
          <button
            type="submit"
            className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded"
          >
            Submit
          </button>
        </form>
        {chatResponse && <p className="mt-2">{chatResponse}</p>}
      </div>

      {/* Workflow Options */}
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <span className="text-gray-400">Chat Model:</span>
          <button className="bg-gray-800 p-2 rounded">Anthropic Chat Model</button>
          <button className="bg-gray-800 p-2 rounded">Postgres Chat Memory</button>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-gray-400">Tools:</span>
          <button className="bg-gray-800 p-2 rounded">Microsoft Entra ID</button>
          <button className="bg-gray-800 p-2 rounded">Jira Software</button>
        </div>
        {isManager ? (
          <button className="bg-green-600 hover:bg-green-700 text-white p-2 rounded">
            Add to Channel
          </button>
        ) : (
          <button className="bg-green-600 hover:bg-green-700 text-white p-2 rounded">
            Update Profile
          </button>
        )}
      </div>
    </div>
  );
};

export default WorkflowPage;
