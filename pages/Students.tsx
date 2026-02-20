import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Card, Button, Input, Badge } from '../components/ui/Common';
import { Plus, Upload, Download, Trash2, Edit2, Filter, X, Save, AlertTriangle } from 'lucide-react';
import { generateId, exportToCSV, MOCK_DEPARTMENTS } from '../utils';
import { Student } from '../types';

export const Students = () => {
  const { state, dispatch, getStudents } = useData();
  const { user } = useAuth();
  const [filter, setFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  
  // Modal States
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Student>>({});

  // Filter Logic
  const filteredStudents = useMemo(() => {
    return getStudents().filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(filter.toLowerCase()) || 
                            student.email.toLowerCase().includes(filter.toLowerCase());
      const matchesDept = deptFilter === 'All' || student.department === deptFilter;
      return matchesSearch && matchesDept;
    });
  }, [state.students, filter, deptFilter]);

  // Handlers
  const initiateDelete = (id: string) => {
    setDeleteConfirmationId(id);
  };

  const confirmDelete = () => {
    if (deleteConfirmationId && user) {
        dispatch({ type: 'DELETE_STUDENT', payload: deleteConfirmationId, user });
        setDeleteConfirmationId(null);
    }
  };

  const handleEdit = (student: Student) => {
      setEditingId(student.id);
      setFormData({ ...student });
      setFormModalOpen(true);
  };

  const handleAdd = () => {
      setEditingId(null);
      setFormData({
          name: '',
          email: '',
          department: 'Computer Science',
          enrollmentYear: new Date().getFullYear(),
          status: 'Active',
          attendance: 100,
          gpa: 0.0,
          feesDue: 0
      });
      setFormModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!formData.name || !formData.email) {
          alert("Name and Email are required");
          return;
      }

      if (editingId) {
          // Update
          const updatedStudent = { 
              ...state.students.find(s => s.id === editingId),
              ...formData 
          } as Student;
          
          dispatch({ type: 'UPDATE_STUDENT', payload: updatedStudent, user: user! });
      } else {
          // Create
          const newStudent = {
              ...formData,
              id: generateId(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              isDeleted: false
          } as Student;
          dispatch({ type: 'ADD_STUDENT', payload: newStudent, user: user! });
      }
      setFormModalOpen(false);
  };

  const handleBulkUpload = () => {
      const mockNewStudents = Array.from({length: 5}).map((_, i) => ({
          id: generateId(),
          name: `Imported Student ${i+1}`,
          email: `import${i}@test.com`,
          department: 'General',
          enrollmentYear: 2024,
          status: 'Active',
          attendance: 100,
          gpa: 8.5,
          feesDue: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isDeleted: false
      })) as Student[];
      
      dispatch({ type: 'BULK_IMPORT_STUDENTS', payload: mockNewStudents, user: user! });
      setUploadModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Student Directory</h1>
        <div className="flex gap-2">
            <Button variant="secondary" onClick={() => exportToCSV(filteredStudents, 'students.csv')}>
                <Download className="w-4 h-4 mr-2" /> Export
            </Button>
            {user?.role !== 'STUDENT' && (
                <>
                    <Button variant="secondary" onClick={() => setUploadModalOpen(true)}>
                        <Upload className="w-4 h-4 mr-2" /> Bulk Upload
                    </Button>
                    <Button onClick={handleAdd}>
                        <Plus className="w-4 h-4 mr-2" /> Add Student
                    </Button>
                </>
            )}
        </div>
      </div>

      {/* Filters */}
      <Card className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input 
                placeholder="Search by name or email..." 
                className="pl-10" 
                value={filter}
                onChange={(e: any) => setFilter(e.target.value)}
              />
          </div>
          <select 
            className="block w-full sm:w-48 rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm border p-2"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
          >
              <option value="All">All Departments</option>
              {MOCK_DEPARTMENTS.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
              ))}
          </select>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                      <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GPA (10)</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                      {filteredStudents.map((student) => (
                          <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                      <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-xs">
                                          {student.name.charAt(0)}
                                      </div>
                                      <div className="ml-4">
                                          <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                          <div className="text-sm text-gray-500">{student.email}</div>
                                      </div>
                                  </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.department}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                  <Badge variant={student.status === 'Active' ? 'green' : student.status === 'At-Risk' ? 'red' : 'gray'}>
                                      {student.status}
                                  </Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  <div className="flex items-center">
                                      <div className="w-16 bg-gray-200 rounded-full h-1.5 mr-2">
                                          <div className={`h-1.5 rounded-full ${student.attendance < 75 ? 'bg-red-500' : 'bg-green-500'}`} style={{width: `${student.attendance}%`}}></div>
                                      </div>
                                      {student.attendance}%
                                  </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono font-bold">{student.gpa.toFixed(2)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  {user?.role !== 'STUDENT' && (
                                      <>
                                          <button 
                                            onClick={() => handleEdit(student)}
                                            className="text-brand-600 hover:text-brand-900 mr-3 p-1 rounded hover:bg-brand-50 transition-colors"
                                            title="Edit"
                                          >
                                              <Edit2 className="w-4 h-4"/>
                                          </button>
                                          <button 
                                            onClick={() => initiateDelete(student.id)} 
                                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                                            title="Delete"
                                          >
                                              <Trash2 className="w-4 h-4"/>
                                          </button>
                                      </>
                                  )}
                              </td>
                          </tr>
                      ))}
                      {filteredStudents.length === 0 && (
                          <tr>
                              <td colSpan={6} className="px-6 py-10 text-center text-gray-500">No students found matching your criteria.</td>
                          </tr>
                      )}
                  </tbody>
              </table>
          </div>
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between">
              <span className="text-sm text-gray-500">Showing {filteredStudents.length} results</span>
              <div className="flex gap-1">
                  <Button variant="secondary" size="sm" disabled>Previous</Button>
                  <Button variant="secondary" size="sm" disabled>Next</Button>
              </div>
          </div>
      </Card>

      {/* Add/Edit Student Modal */}
      {isFormModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-gray-900">{editingId ? 'Edit Student' : 'Add New Student'}</h3>
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
                            <label className="block text-sm font-medium text-gray-700">Status</label>
                            <select 
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm border p-2"
                                value={formData.status}
                                onChange={(e:any) => setFormData({...formData, status: e.target.value as any})}
                            >
                                <option value="Active">Active</option>
                                <option value="At-Risk">At-Risk</option>
                                <option value="Graduated">Graduated</option>
                                <option value="Suspended">Suspended</option>
                            </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-medium text-gray-700">Attendance (%)</label>
                              <Input type="number" min="0" max="100" value={formData.attendance || 0} onChange={(e:any) => setFormData({...formData, attendance: Number(e.target.value)})} />
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-gray-700">GPA (Max 10)</label>
                              <Input type="number" min="0" max="10" step="0.01" value={formData.gpa || 0} onChange={(e:any) => setFormData({...formData, gpa: Number(e.target.value)})} />
                          </div>
                      </div>
                       <div>
                          <label className="block text-sm font-medium text-gray-700">Outstanding Fees ($)</label>
                          <Input type="number" min="0" value={formData.feesDue || 0} onChange={(e:any) => setFormData({...formData, feesDue: Number(e.target.value)})} />
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

      {/* Upload Modal */}
      {isUploadModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">Bulk Upload Students</h3>
                    <button onClick={() => setUploadModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                        <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4 hover:bg-gray-50 cursor-pointer">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Drag and drop CSV file here, or click to browse.</p>
                  </div>
                  <div className="flex justify-end gap-2">
                      <Button variant="ghost" onClick={() => setUploadModalOpen(false)}>Cancel</Button>
                      <Button onClick={handleBulkUpload}>Simulate Upload</Button>
                  </div>
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
                  <h3 className="text-lg font-bold text-center text-gray-900 mb-2">Delete Student?</h3>
                  <p className="text-sm text-gray-500 text-center mb-6">
                      Are you sure you want to move this student to the Recycle Bin? You can restore it later.
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