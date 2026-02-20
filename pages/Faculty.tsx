import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Card, Badge, Button, Input } from '../components/ui/Common';
import { Star, Clock, Plus, Edit2, Trash2, X, Save, AlertTriangle } from 'lucide-react';
import { Faculty } from '../types';
import { generateId, MOCK_DEPARTMENTS } from '../utils';

export const FacultyPage = () => {
  const { state, dispatch, getFaculty } = useData(); 
  const { user } = useAuth();
  const facultyList = getFaculty();

  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Faculty>>({});

  const handleAdd = () => {
    setEditingId(null);
    setFormData({
      name: '',
      email: '',
      department: 'Computer Science',
      title: 'Lecturer',
      workloadHours: 0,
      maxWorkload: 40,
      feedbackScore: 0,
    });
    setFormModalOpen(true);
  };

  const handleEdit = (faculty: Faculty) => {
    setEditingId(faculty.id);
    setFormData({ ...faculty });
    setFormModalOpen(true);
  };

  const initiateDelete = (id: string) => {
    setDeleteConfirmationId(id);
  };

  const confirmDelete = () => {
    if (deleteConfirmationId && user) {
      dispatch({ type: 'DELETE_FACULTY', payload: deleteConfirmationId, user });
      setDeleteConfirmationId(null);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      alert("Name and Email are required");
      return;
    }

    if (editingId) {
       const updatedFaculty = {
         ...state.faculty.find(f => f.id === editingId),
         ...formData
       } as Faculty;
       dispatch({ type: 'UPDATE_FACULTY', payload: updatedFaculty, user: user! });
    } else {
       const newFaculty = {
         ...formData,
         id: generateId(),
         createdAt: new Date().toISOString(),
         updatedAt: new Date().toISOString(),
         isDeleted: false,
       } as Faculty;
       dispatch({ type: 'ADD_FACULTY', payload: newFaculty, user: user! });
    }
    setFormModalOpen(false);
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Faculty Workload & Performance</h1>
          {user?.role !== 'STUDENT' && (
            <Button onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" /> Add Faculty
            </Button>
          )}
       </div>
       
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {facultyList.map(prof => (
               <Card key={prof.id} className="hover:shadow-md transition-shadow relative group">
                   <div className="flex justify-between items-start mb-4">
                       <div>
                           <h3 className="text-lg font-bold text-gray-900">{prof.name}</h3>
                           <p className="text-sm text-gray-500">{prof.title} • {prof.department}</p>
                       </div>
                       <Badge variant={prof.workloadHours > 35 ? 'red' : 'green'}>
                           {prof.workloadHours > 35 ? 'Overloaded' : 'Normal'}
                       </Badge>
                   </div>
                   
                   <div className="space-y-4">
                       <div>
                           <div className="flex justify-between text-sm mb-1">
                               <span className="text-gray-600 flex items-center"><Clock className="w-3 h-3 mr-1"/> Workload</span>
                               <span className="font-medium text-gray-900">{prof.workloadHours} / {prof.maxWorkload} hrs</span>
                           </div>
                           <div className="w-full bg-gray-200 rounded-full h-2">
                               <div 
                                 className={`h-2 rounded-full ${prof.workloadHours > 35 ? 'bg-red-500' : 'bg-brand-500'}`} 
                                 style={{width: `${Math.min((prof.workloadHours / prof.maxWorkload) * 100, 100)}%`}}
                               ></div>
                           </div>
                       </div>

                       <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                           <span className="text-sm text-gray-600">Student Feedback</span>
                           <div className="flex items-center font-bold text-yellow-600">
                               {prof.feedbackScore.toFixed(2)} <Star className="w-4 h-4 ml-1 fill-current" />
                           </div>
                       </div>
                   </div>

                   {/* Actions Overlay/Section */}
                   {user?.role !== 'STUDENT' && (
                     <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(prof)} className="text-brand-600">
                           <Edit2 className="w-4 h-4 mr-1" /> Edit
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => initiateDelete(prof.id)} className="text-red-600">
                           <Trash2 className="w-4 h-4 mr-1" /> Delete
                        </Button>
                     </div>
                   )}
               </Card>
           ))}
       </div>

       {/* Form Modal */}
       {isFormModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-gray-900">{editingId ? 'Edit Faculty' : 'Add New Faculty'}</h3>
                      <button onClick={() => setFormModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                          <X className="w-5 h-5" />
                      </button>
                  </div>
                  <form onSubmit={handleSave} className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-gray-700">Full Name</label>
                          <Input required value={formData.name || ''} onChange={(e:any) => setFormData({...formData, name: e.target.value})} />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700">Email Address</label>
                          <Input required type="email" value={formData.email || ''} onChange={(e:any) => setFormData({...formData, email: e.target.value})} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Department</label>
                            <select 
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm border p-2"
                                value={formData.department}
                                onChange={(e:any) => setFormData({...formData, department: e.target.value})}
                            >
                                {MOCK_DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Title</label>
                            <select 
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm border p-2"
                                value={formData.title}
                                onChange={(e:any) => setFormData({...formData, title: e.target.value})}
                            >
                                <option value="Professor">Professor</option>
                                <option value="Associate Professor">Associate Professor</option>
                                <option value="Lecturer">Lecturer</option>
                                <option value="Assistant">Assistant</option>
                            </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-medium text-gray-700">Workload Hours</label>
                              <Input type="number" min="0" max="100" value={formData.workloadHours || 0} onChange={(e:any) => setFormData({...formData, workloadHours: Number(e.target.value)})} />
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-gray-700">Max Workload</label>
                              <Input type="number" min="0" max="100" value={formData.maxWorkload || 40} onChange={(e:any) => setFormData({...formData, maxWorkload: Number(e.target.value)})} />
                          </div>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700">Feedback Score (0-10)</label>
                          <Input type="number" min="0" max="10" step="0.01" value={formData.feedbackScore || 0} onChange={(e:any) => setFormData({...formData, feedbackScore: Number(e.target.value)})} />
                      </div>
                      <div className="flex justify-end gap-2 mt-6">
                          <Button variant="ghost" type="button" onClick={() => setFormModalOpen(false)}>Cancel</Button>
                          <Button type="submit">
                              <Save className="w-4 h-4 mr-2" /> Save Changes
                          </Button>
                      </div>
                  </form>
              </div>
          </div>
       )}

       {/* Delete Confirmation Modal */}
       {deleteConfirmationId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-2xl">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-bold text-center text-gray-900 mb-2">Delete Faculty?</h3>
                  <p className="text-sm text-gray-500 text-center mb-6">
                      Are you sure you want to remove this faculty member? This action can be undone from the Recycle Bin.
                  </p>
                  <div className="flex gap-3">
                      <Button variant="ghost" className="w-full justify-center border" onClick={() => setDeleteConfirmationId(null)}>Cancel</Button>
                      <Button variant="danger" className="w-full justify-center" onClick={confirmDelete}>Delete</Button>
                  </div>
              </div>
          </div>
       )}

    </div>
  );
};