import { useState, useEffect } from 'react';
import api from '../api';
import { KeyRound, Shield, Trash2, Plus, RefreshCw, BarChart2, Eye, Server } from 'lucide-react';

export default function ApiKeys() {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  
  const [newKey, setNewKey] = useState({
    name: '',
    permissions: 'read:alumni'
  });
  
  const [selectedKeyStats, setSelectedKeyStats] = useState(null);

  const fetchKeys = async () => {
    try {
      const res = await api.get('/admin/api-keys');
      setKeys(res.data);
    } catch (err) {
      console.error('Failed to fetch API keys', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const permsArray = newKey.permissions.split(',').map(s => s.trim());
      await api.post('/admin/api-keys', {
        name: newKey.name,
        permissions: permsArray
      });
      setShowCreate(false);
      setNewKey({ name: '', permissions: 'read:alumni' });
      fetchKeys();
    } catch (err) {
      console.error(err);
      alert('Failed to generate API Key');
    }
  };

  const handleRevoke = async (keyId) => {
    if(!window.confirm("Are you sure you want to revoke this key? Client applications using it will be blocked immediately.")) return;
    try {
      await api.delete(`/admin/api-keys/${keyId}`);
      fetchKeys();
      if(selectedKeyStats?._id === keyId) setSelectedKeyStats(null);
    } catch (err) {
      console.error(err);
    }
  };

  const viewStats = async (key) => {
    try {
      const res = await api.get(`/admin/api-keys/${key._id}/stats`);
      setSelectedKeyStats({ ...key, stats: res.data });
    } catch (err) {
      console.error('Failed to get stats', err);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-gray-900 text-white p-8 rounded-2xl shadow-xl overflow-hidden relative">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Shield className="w-8 h-8 text-purple-400" />
            Security & Token Access
          </h1>
          <p className="text-gray-400 max-w-xl">
            Manage scoped API keys for external applications (e.g. Mobile AR App vs Analytics Platform). Ensure keys have minimum necessary privileges.
          </p>
        </div>
        <Server className="absolute right-8 top-1/2 -translate-y-1/2 w-48 h-48 text-gray-800 opacity-50 pointer-events-none" />
      </div>

      <div className="flex justify-between items-center mt-8">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <KeyRound className="w-5 h-5" /> Active API Keys
        </h2>
        <button 
          onClick={() => setShowCreate(!showCreate)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
        >
          {showCreate ? 'Cancel' : <><Plus className="w-4 h-4" /> Generate New Key</>}
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="bg-white p-6 rounded-xl border border-purple-100 shadow-md flex items-end gap-4 animate-in fade-in slide-in-from-top-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Application Name</label>
            <input 
              required
              value={newKey.name}
              onChange={(e) => setNewKey({...newKey, name: e.target.value})}
              placeholder="e.g. Mobile AR App"
              className="w-full border-gray-300 rounded-lg px-4 py-2 border focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Permissions (comma separated)</label>
            <input 
              required
              value={newKey.permissions}
              onChange={(e) => setNewKey({...newKey, permissions: e.target.value})}
              placeholder="read:alumni, read:analytics"
              className="w-full border-gray-300 rounded-lg px-4 py-2 border focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <button type="submit" className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2.5 rounded-lg flex items-center gap-2">
            Create Token
          </button>
        </form>
      )}

      {/* Keys List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 flex items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin" /> Loading keys...
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
                <th className="p-4 font-medium">Application Context</th>
                <th className="p-4 font-medium">Scope (Permissions)</th>
                <th className="p-4 font-medium">Created On</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {keys.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-500">No API keys found.</td>
                </tr>
              )}
              {keys.map((key) => (
                <tr key={key._id} className="border-b border-gray-50 hover:bg-gray-50 last:border-0 transition-colors">
                  <td className="p-4 font-medium text-gray-900">{key.name}</td>
                  <td className="p-4">
                    <div className="flex gap-1 flex-wrap">
                      {key.permissions?.map(p => (
                        <span key={p} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium border border-blue-100">
                          {p}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-500">
                    {new Date(key.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 flex items-center gap-3">
                    <button onClick={() => viewStats(key)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="View Usage Stats">
                      <BarChart2 className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleRevoke(key._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Revoke Key">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Usage Stats Modal/Section */}
      {selectedKeyStats && (
        <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl relative">
          <button 
            onClick={() => setSelectedKeyStats(null)}
            className="absolute top-4 right-4 text-indigo-400 hover:text-indigo-600"
          >
            Close
          </button>
          <h3 className="font-bold text-indigo-900 flex items-center gap-2 mb-4">
            <Eye className="w-5 h-5" />
            Usage Statistics: {selectedKeyStats.name}
          </h3>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <span className="block text-sm text-gray-500 font-medium">Total Invocations</span>
              <span className="text-2xl font-bold text-gray-900">
                 {selectedKeyStats.stats?.totalCalls || 0}
              </span>
            </div>
            
            <div className="bg-white p-4 rounded-xl shadow-sm col-span-2">
              <span className="block text-sm text-gray-500 font-medium mb-2">Recent Uses</span>
              {selectedKeyStats.stats?.recentLogs && selectedKeyStats.stats.recentLogs.length > 0 ? (
                <ul className="text-sm space-y-2">
                  {selectedKeyStats.stats.recentLogs.map((log, i) => (
                    <li key={i} className="flex justify-between border-b border-gray-50 pb-1">
                      <code className="text-indigo-600">{log.endpoint}</code>
                      <span className="text-gray-400">{new Date(log.timestamp).toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-gray-400 text-sm">No recent logs</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
