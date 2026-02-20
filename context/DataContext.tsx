import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Student, Faculty, AuditRecord, Notification, User } from '../types';
import { generateStudents, generateFaculty, generateId } from '../utils';
import { useAuth } from './AuthContext';

// --- State Definition ---
interface AppState {
  students: Student[];
  faculty: Faculty[];
  auditLogs: AuditRecord[];
  notifications: Notification[];
  lastAction: { type: string; payload: any; undoData: any } | null;
}

type Action =
  | { type: 'INIT_DATA' }
  | { type: 'ADD_STUDENT'; payload: Student; user: User }
  | { type: 'UPDATE_STUDENT'; payload: Student; user: User }
  | { type: 'DELETE_STUDENT'; payload: string; user: User } // ID
  | { type: 'RESTORE_STUDENT'; payload: string; user: User }
  | { type: 'PERMANENT_DELETE_STUDENT'; payload: string; user: User }
  | { type: 'BULK_IMPORT_STUDENTS'; payload: Student[]; user: User }
  // Faculty Actions
  | { type: 'ADD_FACULTY'; payload: Faculty; user: User }
  | { type: 'UPDATE_FACULTY'; payload: Faculty; user: User }
  | { type: 'DELETE_FACULTY'; payload: string; user: User }
  
  | { type: 'UNDO_ACTION' }
  | { type: 'RESTORE_BACKUP'; payload: Partial<AppState> }
  | { type: 'DISMISS_NOTIFICATION'; payload: string };

const initialState: AppState = {
  students: [],
  faculty: [],
  auditLogs: [],
  notifications: [],
  lastAction: null,
};

// --- Reducer with Business Logic ---
const dataReducer = (state: AppState, action: Action): AppState => {
  const createAudit = (user: User, actionType: AuditRecord['action'], module: AuditRecord['module'], details: string): AuditRecord => ({
    id: generateId(),
    timestamp: new Date().toISOString(),
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: actionType,
    module,
    details,
  });

  const createNotification = (title: string, message: string, type: Notification['type']): Notification => ({
    id: generateId(),
    title,
    message,
    type,
    timestamp: new Date().toISOString(),
    read: false,
  });

  switch (action.type) {
    case 'INIT_DATA':
      return {
        ...state,
        students: generateStudents(50),
        faculty: generateFaculty(10),
      };

    case 'ADD_STUDENT': {
      const newStudent = action.payload;
      return {
        ...state,
        students: [newStudent, ...state.students],
        auditLogs: [createAudit(action.user, 'CREATE', 'STUDENT', `Created student ${newStudent.name}`), ...state.auditLogs],
        lastAction: { type: 'ADD_STUDENT', payload: newStudent.id, undoData: null }, // Simple undo could be delete
        notifications: [createNotification('Student Created', `${newStudent.name} added successfully.`, 'success'), ...state.notifications],
      };
    }

    case 'UPDATE_STUDENT': {
      const updated = action.payload;
      const old = state.students.find(s => s.id === updated.id);
      if (!old) return state;

      return {
        ...state,
        students: state.students.map(s => s.id === updated.id ? updated : s),
        auditLogs: [createAudit(action.user, 'UPDATE', 'STUDENT', `Updated ${updated.name}`), ...state.auditLogs],
        lastAction: { type: 'UPDATE_STUDENT', payload: updated, undoData: old },
        notifications: [createNotification('Student Updated', 'Changes saved.', 'success'), ...state.notifications],
      };
    }

    case 'DELETE_STUDENT': {
      const idToDelete = action.payload;
      const student = state.students.find(s => s.id === idToDelete);
      if (!student) return state;

      return {
        ...state,
        students: state.students.map(s => s.id === idToDelete ? { ...s, isDeleted: true, deletedAt: new Date().toISOString(), deletedBy: action.user.name } : s),
        auditLogs: [createAudit(action.user, 'DELETE', 'STUDENT', `Soft deleted ${student.name}`), ...state.auditLogs],
        lastAction: { type: 'DELETE_STUDENT', payload: idToDelete, undoData: null },
        notifications: [createNotification('Moved to Recycle Bin', 'Item can be restored.', 'warning'), ...state.notifications],
      };
    }

    case 'RESTORE_STUDENT': {
      return {
        ...state,
        students: state.students.map(s => s.id === action.payload ? { ...s, isDeleted: false, deletedAt: undefined, deletedBy: undefined } : s),
        auditLogs: [createAudit(action.user, 'RESTORE', 'STUDENT', `Restored student ID ${action.payload}`), ...state.auditLogs],
        notifications: [createNotification('Restored', 'Student restored successfully.', 'success'), ...state.notifications],
      };
    }

    case 'PERMANENT_DELETE_STUDENT': {
        return {
            ...state,
            students: state.students.filter(s => s.id !== action.payload),
            auditLogs: [createAudit(action.user, 'DELETE', 'STUDENT', `Permanently deleted student ID ${action.payload}`), ...state.auditLogs],
        }
    }

    case 'BULK_IMPORT_STUDENTS': {
      const newStudents = action.payload;
      return {
        ...state,
        students: [...newStudents, ...state.students],
        auditLogs: [createAudit(action.user, 'BULK_IMPORT', 'STUDENT', `Imported ${newStudents.length} students`), ...state.auditLogs],
        notifications: [createNotification('Bulk Import', `${newStudents.length} records imported.`, 'success'), ...state.notifications],
      };
    }

    // --- Faculty Reducers ---
    case 'ADD_FACULTY': {
      const newFaculty = action.payload;
      return {
        ...state,
        faculty: [newFaculty, ...state.faculty],
        auditLogs: [createAudit(action.user, 'CREATE', 'FACULTY', `Created faculty ${newFaculty.name}`), ...state.auditLogs],
        notifications: [createNotification('Faculty Added', `${newFaculty.name} added successfully.`, 'success'), ...state.notifications],
      };
    }

    case 'UPDATE_FACULTY': {
      const updated = action.payload;
      return {
        ...state,
        faculty: state.faculty.map(f => f.id === updated.id ? updated : f),
        auditLogs: [createAudit(action.user, 'UPDATE', 'FACULTY', `Updated faculty ${updated.name}`), ...state.auditLogs],
        notifications: [createNotification('Faculty Updated', 'Changes saved.', 'success'), ...state.notifications],
      };
    }

    case 'DELETE_FACULTY': {
      const idToDelete = action.payload;
      const faculty = state.faculty.find(f => f.id === idToDelete);
      if (!faculty) return state;

      return {
        ...state,
        faculty: state.faculty.map(f => f.id === idToDelete ? { ...f, isDeleted: true, deletedAt: new Date().toISOString(), deletedBy: action.user.name } : f),
        auditLogs: [createAudit(action.user, 'DELETE', 'FACULTY', `Soft deleted faculty ${faculty.name}`), ...state.auditLogs],
        notifications: [createNotification('Moved to Recycle Bin', 'Faculty member removed.', 'warning'), ...state.notifications],
      };
    }
    // ----------------------

    case 'UNDO_ACTION': {
      if (!state.lastAction) return state;
      const { type, payload, undoData } = state.lastAction;
      
      // Simple implementation of Undo for specific actions
      if (type === 'DELETE_STUDENT') {
        // Undo a delete means restore
        return {
           ...state,
           students: state.students.map(s => s.id === payload ? { ...s, isDeleted: false } : s),
           notifications: [createNotification('Undo Successful', 'Action reversed.', 'info'), ...state.notifications],
           lastAction: null,
        }
      }
      if (type === 'UPDATE_STUDENT' && undoData) {
        // Undo update means revert to old data
        return {
            ...state,
            students: state.students.map(s => s.id === undoData.id ? undoData : s),
            notifications: [createNotification('Undo Successful', 'Changes reverted.', 'info'), ...state.notifications],
            lastAction: null,
        }
      }
      return state;
    }

    case 'RESTORE_BACKUP': {
        return {
            ...state,
            ...action.payload,
            notifications: [createNotification('System Restore', 'System restored from backup.', 'warning'), ...state.notifications],
        }
    }
    
    case 'DISMISS_NOTIFICATION':
        return {
            ...state,
            notifications: state.notifications.filter(n => n.id !== action.payload)
        }

    default:
      return state;
  }
};

// --- Context & Provider ---
interface DataContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  getStudents: (includeDeleted?: boolean) => Student[];
  getFaculty: () => Faculty[];
  restoreBackup: (jsonString: string) => void;
  undo: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(dataReducer, initialState);
  const { user } = useAuth();

  useEffect(() => {
    dispatch({ type: 'INIT_DATA' });
  }, []);

  // Check for at-risk students and notify automatically (Intelligence Feature)
  useEffect(() => {
    const atRisk = state.students.filter(s => !s.isDeleted && s.attendance < 75);
    if (atRisk.length > 0 && state.notifications.length === 0) {
      // Avoid infinite loop of notifications in this demo
      // In real app, check if notification already sent today
    }
  }, [state.students]);

  const getStudents = (includeDeleted = false) => {
    return state.students.filter(s => includeDeleted ? true : !s.isDeleted);
  };

  const getFaculty = () => state.faculty.filter(f => !f.isDeleted);

  const restoreBackup = (jsonString: string) => {
      try {
          const parsed = JSON.parse(jsonString);
          dispatch({ type: 'RESTORE_BACKUP', payload: parsed });
      } catch (e) {
          alert("Invalid Backup File");
      }
  }

  const undo = () => dispatch({ type: 'UNDO_ACTION' });

  return (
    <DataContext.Provider value={{ state, dispatch, getStudents, getFaculty, restoreBackup, undo }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};