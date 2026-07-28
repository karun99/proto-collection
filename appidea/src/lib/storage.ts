import CryptoJS from 'crypto-js';

const SECRET_KEY = process.env.NEXT_PUBLIC_SECRET_KEY || 'appidea-default-local-key';

export const encryptData = (data: any): string => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
};

export const decryptData = (ciphertext: string): any => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedData);
  } catch (error) {
    console.error('Failed to decrypt data:', error);
    return null;
  }
};

export const saveToStorage = (key: string, data: any) => {
  if (typeof window !== 'undefined') {
    const encrypted = encryptData(data);
    localStorage.setItem(key, encrypted);
  }
};

export const getFromStorage = (key: string): any => {
  if (typeof window !== 'undefined') {
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return null;
    return decryptData(encrypted);
  }
  return null;
};
