
import React, { useState, useEffect, useCallback } from 'react';
import { KeyValuePair, LocalStorageItem } from './types';

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

const App: React.FC = () => {
  const [inputs, setInputs] = useState<KeyValuePair[]>([{ id: generateId(), key: '', value: '' }]);
  const [storedItems, setStoredItems] = useState<LocalStorageItem[]>([]);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Sync stored items from localStorage
  const refreshStoredItems = useCallback(() => {
    const items: LocalStorageItem[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key !== null) {
        const value = localStorage.getItem(key) || '';
        items.push({
          key,
          value,
          size: new Blob([key + value]).size
        });
      }
    }
    setStoredItems(items.sort((a, b) => a.key.localeCompare(b.key)));
  }, []);

  useEffect(() => {
    refreshStoredItems();
  }, [refreshStoredItems]);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const addRow = () => {
    setInputs([...inputs, { id: generateId(), key: '', value: '' }]);
  };

  const removeRow = (id: string) => {
    if (inputs.length > 1) {
      setInputs(inputs.filter(row => row.id !== id));
    }
  };

  const handleInputChange = (id: string, field: 'key' | 'value', val: string) => {
    setInputs(inputs.map(row => row.id === id ? { ...row, [field]: val } : row));
  };

  const saveToLocalStorage = () => {
    let count = 0;
    inputs.forEach(row => {
      if (row.key.trim()) {
        localStorage.setItem(row.key.trim(), row.value);
        count++;
      }
    });

    if (count > 0) {
      showNotification(`Successfully saved ${count} item(s)`);
      refreshStoredItems();
      setInputs([{ id: generateId(), key: '', value: '' }]);
    } else {
      showNotification('Please enter at least one key', 'error');
    }
  };

  const deleteItem = (key: string) => {
    localStorage.removeItem(key);
    refreshStoredItems();
    showNotification(`Deleted "${key}"`);
  };

  const clearAll = () => {
    if (confirm('Are you sure you want to clear ALL LocalStorage data?')) {
      localStorage.clear();
      refreshStoredItems();
      showNotification('LocalStorage cleared');
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <header className="mb-8 text-center md:text-left">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center justify-center md:justify-start gap-3">
          <i className="fas fa-vault text-indigo-600"></i>
          Local Vault Manager
        </h1>
        <p className="text-slate-500 mt-1">Manage browser local storage with ease.</p>
      </header>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Input Section */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit lg:sticky lg:top-8">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <i className="fas fa-plus-circle text-emerald-500"></i>
            Add New Data
          </h2>
          
          <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
            {inputs.map((row) => (
              <div key={row.id} className="flex gap-2 items-start bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    placeholder="Key"
                    value={row.key}
                    onChange={(e) => handleInputChange(row.id, 'key', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm font-medium"
                  />
                  <textarea
                    placeholder="Value"
                    value={row.value}
                    rows={1}
                    onChange={(e) => handleInputChange(row.id, 'value', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm resize-none"
                  />
                </div>
                <button
                  onClick={() => removeRow(row.id)}
                  disabled={inputs.length === 1}
                  className="mt-2 p-2 text-slate-400 hover:text-red-500 transition-colors disabled:opacity-0"
                >
                  <i className="fas fa-trash-alt"></i>
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={addRow}
              className="w-full py-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 border border-slate-200 font-medium"
            >
              <i className="fas fa-plus"></i> Add Another Row
            </button>
            <button
              onClick={saveToLocalStorage}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 font-semibold flex items-center justify-center gap-2"
            >
              <i className="fas fa-save"></i> Save to LocalStorage
            </button>
          </div>
        </div>

        {/* View Section */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <i className="fas fa-database text-blue-500"></i>
              Stored Items ({storedItems.length})
            </h2>
            {storedItems.length > 0 && (
              <button
                onClick={clearAll}
                className="text-sm text-red-500 hover:underline font-medium flex items-center gap-1"
              >
                <i className="fas fa-broom"></i> Clear All
              </button>
            )}
          </div>

          {storedItems.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-slate-100 rounded-2xl">
              <i className="fas fa-box-open text-4xl text-slate-200 mb-4 block"></i>
              <p className="text-slate-400">LocalStorage is currently empty.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {storedItems.map((item) => (
                <div key={item.key} className="group relative bg-white border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 p-4 rounded-xl transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-slate-700 truncate">{item.key}</span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded font-mono">
                          {(item.size / 1024).toFixed(2)} KB
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-mono break-all line-clamp-2 bg-slate-50/50 p-2 rounded border border-slate-100 group-hover:bg-white transition-colors">
                        {item.value}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(item.value);
                          showNotification('Value copied to clipboard!');
                        }}
                        className="p-2 text-slate-400 hover:text-indigo-600 bg-white rounded-lg border border-slate-100 shadow-sm"
                        title="Copy Value"
                      >
                        <i className="fas fa-copy text-xs"></i>
                      </button>
                      <button
                        onClick={() => deleteItem(item.key)}
                        className="p-2 text-slate-400 hover:text-red-500 bg-white rounded-lg border border-slate-100 shadow-sm"
                        title="Delete Key"
                      >
                        <i className="fas fa-trash text-xs"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Global Notifications */}
      {notification && (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 transition-all animate-bounce ${
          notification.type === 'success' ? 'bg-slate-800 text-white' : 'bg-red-600 text-white'
        }`}>
          <i className={`fas ${notification.type === 'success' ? 'fa-check-circle text-emerald-400' : 'fa-exclamation-circle'}`}></i>
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}

      {/* Inline styles for custom scrollbar */}
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}} />
    </div>
  );
};

export default App;
