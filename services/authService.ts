
import { User, QuizAttempt, StudySession } from '../types';

const STORAGE_KEY = 'oracle_users';
const SESSION_KEY = 'oracle_current_session';
const SCORES_KEY = 'oracle_global_scores';
const DB_NAME = 'OracleDB';
const DB_VERSION = 1;
const STORE_NAME = 'study_history';

const getDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const authService = {
  signup: async (email: string, password: string, name: string): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 800)); 
    const users = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (users.find((u: any) => u.email === email)) throw new Error('Account already exists.');
    
    const newUser: User = { 
      id: Math.random().toString(36).substr(2, 9), 
      email, 
      name,
      friends: [],
      credits: 0
    };
    const authData = { ...newUser, password: btoa(password) }; 
    users.push(authData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
    return newUser;
  },

  login: async (email: string, password: string): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const users = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const user = users.find((u: any) => u.email === email && u.password === btoa(password));
    if (!user) throw new Error('Invalid credentials.');

    const { password: _, ...userData } = user;
    if (userData.credits === undefined) userData.credits = 0;
    localStorage.setItem(SESSION_KEY, JSON.stringify(userData));
    return userData;
  },

  logout: () => localStorage.removeItem(SESSION_KEY),

  getCurrentUser: (): User | null => {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
  },

  addCredits: (amount: number): User | null => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return null;
    
    const users = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const newTotal = (currentUser.credits || 0) + amount;
    
    const updatedUsers = users.map((u: any) => {
      if (u.id === currentUser.id) {
        return { ...u, credits: newTotal };
      }
      return u;
    });
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUsers));
    const updatedUser = { ...currentUser, credits: newTotal };
    localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
    return updatedUser;
  },

  getAllUsers: (): User[] => {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return users.map(({ password, ...u }: any) => u).sort((a: any, b: any) => (b.credits || 0) - (a.credits || 0));
  },

  addFriend: (friendId: string) => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return;
    const users = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const updatedUsers = users.map((u: any) => {
      if (u.id === currentUser.id) {
        const friends = u.friends || [];
        if (!friends.includes(friendId)) friends.push(friendId);
        return { ...u, friends };
      }
      return u;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUsers));
    const updatedSelf = updatedUsers.find((u: any) => u.id === currentUser.id);
    localStorage.setItem(SESSION_KEY, JSON.stringify(updatedSelf));
  },

  getFriends: (): User[] => {
    const user = authService.getCurrentUser();
    if (!user || !user.friends) return [];
    const allUsers = authService.getAllUsers();
    return allUsers.filter(u => user.friends?.includes(u.id));
  },

  saveQuizAttempt: (attemptData: Omit<QuizAttempt, 'id' | 'timestamp' | 'userId' | 'userName'>) => {
    const user = authService.getCurrentUser();
    if (!user) return;

    const history: QuizAttempt[] = JSON.parse(localStorage.getItem(SCORES_KEY) || '[]');
    const fullAttempt: QuizAttempt = {
      ...attemptData,
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      userName: user.name,
      timestamp: Date.now()
    };

    history.push(fullAttempt);
    localStorage.setItem(SCORES_KEY, JSON.stringify(history));
  },

  getQuizAttempts: (userId?: string): QuizAttempt[] => {
    const history: QuizAttempt[] = JSON.parse(localStorage.getItem(SCORES_KEY) || '[]');
    if (userId) return history.filter(a => a.userId === userId);
    return history;
  },

  saveStudySession: async (sessionData: Omit<StudySession, 'id' | 'timestamp' | 'userId'>): Promise<string> => {
    const user = authService.getCurrentUser();
    if (!user) throw new Error("No user");

    const db = await getDB();
    const sessionId = Math.random().toString(36).substr(2, 9);
    const newSession: StudySession = {
      ...sessionData,
      id: sessionId,
      userId: user.id,
      timestamp: Date.now(),
      rewardClaimed: false
    };
    
    return new Promise<string>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.add(newSession);
      request.onsuccess = () => resolve(sessionId);
      request.onerror = () => reject(request.error);
    });
  },

  updateStudySession: async (session: StudySession): Promise<void> => {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(session);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  getStudyHistory: async (userId: string): Promise<StudySession[]> => {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => {
        const all = request.result as StudySession[];
        const filtered = all.filter(h => h.userId === userId).sort((a, b) => b.timestamp - a.timestamp);
        resolve(filtered);
      };
      request.onerror = () => reject(request.error);
    });
  },

  deleteStudySession: async (sessionId: string) => {
    const db = await getDB();
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(sessionId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  getSessionRankings: (sessionId: string): QuizAttempt[] => {
    const history: QuizAttempt[] = JSON.parse(localStorage.getItem(SCORES_KEY) || '[]');
    return history
      .filter(a => a.sessionId === sessionId)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.timeTaken - b.timeTaken;
      });
  }
};
