import React, { useState } from 'react';

const WorkflowPage = () => {
  const [tasks, setTasks] = useState([]);
  const [notes, setNotes] = useState('');
  const [newTask, setNewTask] = useState('');

  const addTask = (e) => {
    e.preventDefault();
    if (newTask.trim()) {
      setTasks([...tasks, { id: Date.now(), text: newTask, completed: false }]);
      setNewTask('');
    }
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Workflow Manager</h1>

      {/* Tasks Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Tasks</h2>
        <form onSubmit={addTask} className="mb-4">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a new task..."
            className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded"
          >
            Add Task
          </button>
        </form>
        <ul className="space-y-2">
          {tasks.map(task => (
            <li key={task.id} className="flex items-center justify-between bg-gray-800 p-2 rounded">
              <span
                className={`flex-1 ${task.completed ? 'line-through text-gray-500' : ''}`}
                onClick={() => toggleTask(task.id)}
              >
                {task.text}
              </span>
              <button
                onClick={() => deleteTask(task.id)}
                className="ml-4 bg-red-600 hover:bg-red-700 text-white p-1 rounded"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Notes Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Notes</h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Write your notes here..."
          className="w-full h-40 p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
};

export default WorkflowPage;
