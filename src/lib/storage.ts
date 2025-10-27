const STORAGE_KEY = 'subsplit-data';

interface StorageData {
  subscriptions: any[];
  familyMembers: any[];
  rotations: any[];
  notes: any[];
}

const defaultData: StorageData = {
  subscriptions: [],
  familyMembers: [],
  rotations: [],
  notes: []
};

export const storage = {
  getData(): StorageData {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : defaultData;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultData;
    }
  },

  setData(data: StorageData): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  },

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
};
