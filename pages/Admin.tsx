import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Card, Button, Badge } from '../components/ui/Common';
import { Shield, RotateCcw, Trash2, Download, Save, RefreshCw } from 'lucide-react';
import { formatDate } from '../utils';

export const Admin = () => {
  const { state, dispatch, restoreBackup } = useData();
  const { user, impersonate } = useAuth();
  const [activeTab, setActiveTab] = useState<'audit' | 'recycle' | 'backup'>('audit');

  if (user?.role !== 'SUPER_ADMIN') return <div className="p-10 text-center">Access Denied</div>;

  const deletedStudents = state.students.filter(s => s.isDeleted);
  
  const handleRestore = (id: string) => {
      dispatch({ type: 'RESTORE_STUDENT', payload: id, user });
  };

  const handlePermanentDelete = (id: string) => {
      if(confirm("Are you sure? This cannot be undone.")) {
          dispatch({ type: 'PERMANENT_DELETE_STUDENT', payload: id, user });
      }
  };

  const downloadBackup = () => {
      const backupData = JSON.stringify(state, null, 2);
      const blob = new Blob([backupData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup-${new Date().toISOString()}.json`;
      link.click();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">System Administration</h1>

      {/* Tabs */}
      <div className="flex space-x-1 bg-white p-1 rounded-lg border border-gray-200 inline-flex">
          <button 
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'audit' ? 'bg-brand-100 text-brand-700' : 'text-gray-600 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('audit')}
          >
              Audit Logs
          </button>
          <button 
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'recycle' ? 'bg-brand-100 text-brand-700' : 'text-gray-600 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('recycle')}
          >
              Recycle Bin ({deletedStudents.length})
          </button>
          <button 
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'backup' ? 'bg-brand-100 text-brand-700' : 'text-gray-600 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('backup')}
          >
              Backup & Recovery
          </button>
      </div>

      {activeTab === 'audit' && (
          <Card className="p-0 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="font-medium text-gray-700">Recent System Activity</h3>
              </div>
              <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                      <thead className="bg-gray-50">
                          <tr>
                              <th className="px-6 py-3 text-left font-medium text-gray-500">Time</th>
                              <th className="px-6 py-3 text-left font-medium text-gray-500">User</th>
                              <th className="px-6 py-3 text-left font-medium text-gray-500">Action</th>
                              <th className="px-6 py-3 text-left font-medium text-gray-500">Details</th>
                          </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                          {state.auditLogs.map(log => (
                              <tr key={log.id}>
                                  <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{formatDate(log.timestamp)}</td>
                                  <td className="px-6 py-4 font-medium text-gray-900">{log.userName} <span className="text-xs text-gray-400 font-normal">({log.userRole})</span></td>
                                  <td className="px-6 py-4">
                                      <Badge variant={log.action === 'DELETE' ? 'red' : log.action === 'CREATE' ? 'green' : 'blue'}>
                                          {log.action}
                                      </Badge>
                                  </td>
                                  <td className="px-6 py-4 text-gray-600">{log.details}</td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </Card>
      )}

      {activeTab === 'recycle' && (
          <Card>
              <h3 className="font-bold text-gray-800 mb-4">Deleted Items</h3>
              {deletedStudents.length === 0 ? (
                  <p className="text-gray-500">Recycle bin is empty.</p>
              ) : (
                  <ul className="space-y-4">
                      {deletedStudents.map(item => (
                          <li key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                              <div>
                                  <p className="font-bold text-gray-900">{item.name}</p>
                                  <p className="text-xs text-gray-500">Deleted by {item.deletedBy} on {formatDate(item.deletedAt!)}</p>
                              </div>
                              <div className="flex space-x-2">
                                  <Button size="sm" variant="ghost" onClick={() => handleRestore(item.id)} className="text-green-600 hover:text-green-700">
                                      <RotateCcw className="w-4 h-4 mr-1" /> Restore
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={() => handlePermanentDelete(item.id)} className="text-red-600 hover:text-red-700">
                                      <Trash2 className="w-4 h-4 mr-1" /> Delete Forever
                                  </Button>
                              </div>
                          </li>
                      ))}
                  </ul>
              )}
          </Card>
      )}

      {activeTab === 'backup' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                  <h3 className="font-bold text-gray-800 mb-2">Create Backup</h3>
                  <p className="text-sm text-gray-600 mb-4">Download a full JSON snapshot of the system state, including all records and configuration.</p>
                  <Button onClick={downloadBackup}>
                      <Download className="w-4 h-4 mr-2" /> Download Backup
                  </Button>
              </Card>

              <Card>
                  <h3 className="font-bold text-gray-800 mb-2">Restore System</h3>
                  <p className="text-sm text-gray-600 mb-4">Upload a previous backup file to restore the database. ⚠️ This will overwrite current data.</p>
                  <div className="relative">
                      <Button variant="danger">
                           <RefreshCw className="w-4 h-4 mr-2" /> Upload & Restore
                      </Button>
                      <input 
                        type="file" 
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if(file) {
                                const reader = new FileReader();
                                reader.onload = (ev) => restoreBackup(ev.target?.result as string);
                                reader.readAsText(file);
                            }
                        }}
                      />
                  </div>
              </Card>

              <Card>
                  <h3 className="font-bold text-gray-800 mb-2">Impersonation Tool</h3>
                  <p className="text-sm text-gray-600 mb-4">Test permissions by viewing the system as a different role.</p>
                  <div className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => impersonate('FACULTY')}>Faculty</Button>
                      <Button size="sm" variant="secondary" onClick={() => impersonate('STUDENT')}>Student</Button>
                  </div>
              </Card>
          </div>
      )}
    </div>
  );
};
