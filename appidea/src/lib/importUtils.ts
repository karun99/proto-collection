import { parseCSV } from './csvUtils';

export const importData = async <T>(file: File): Promise<T[]> => {
  const text = await file.text();
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith('.json')) {
    try {
      const data = JSON.parse(text);
      if (Array.isArray(data)) return data;
      // Handle backup format where data is nested
      if (data.prompts && Array.isArray(data.prompts)) return data.prompts as any;
      if (data.submissions && Array.isArray(data.submissions)) return data.submissions as any;
      return [data];
    } catch (e) {
      throw new Error('Invalid JSON format');
    }
  } else if (fileName.endsWith('.csv')) {
    try {
      return parseCSV(text) as T[];
    } catch (e) {
      throw new Error('Invalid CSV format');
    }
  } else {
    throw new Error('Unsupported file format. Please use .json or .csv');
  }
};
