import { useState, useEffect, useCallback } from 'react';
import {
  getResumes,
  addResume,
  deleteResume,
  setDefaultResume,
  onStorageChange,
  STORAGE_KEYS,
} from '@/lib/storage';
import { generateId } from '@/lib/utils';
import type { ResumeItem } from '@/types/profile';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export function useResumes() {
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadResumes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getResumes();
      setResumes(data);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadResumes();
    const unsubscribe = onStorageChange((changes) => {
      if (changes[STORAGE_KEYS.RESUMES]) {
        loadResumes();
      }
    });
    return unsubscribe;
  }, [loadResumes]);

  const validateFile = useCallback((file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Please upload a PDF, DOC, or DOCX file';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 5MB';
    }
    return null;
  }, []);

  const uploadResume = useCallback(async (file: File): Promise<ResumeItem> => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return Promise.reject(new Error(validationError));
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const dataUrl = reader.result as string;
          const isFirst = resumes.length === 0;
          
          const resume: ResumeItem = {
            id: generateId(),
            name: file.name,
            size: file.size,
            date: Date.now(),
            isDefault: isFirst,
            dataUrl,
            mimeType: file.type || 'application/pdf',
          };

          await addResume(resume);
          setError(null);
          resolve(resume);
        } catch (err) {
          setError('Failed to upload resume');
          reject(err);
        }
      };
      reader.onerror = () => {
        setError('Failed to read file');
        reject(reader.error);
      };
      reader.readAsDataURL(file);
    });
  }, [resumes.length, validateFile]);

  const removeResume = useCallback(async (id: string) => {
    await deleteResume(id);
  }, []);

  const makeDefault = useCallback(async (id: string) => {
    await setDefaultResume(id);
  }, []);

  const previewResume = useCallback((resume: ResumeItem) => {
    const blob = dataUrlToBlob(resume.dataUrl);
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, []);

  const getDefaultResume = useCallback(() => {
    return resumes.find((r) => r.isDefault) ?? resumes[0] ?? null;
  }, [resumes]);

  const defaultResume = resumes.find((r) => r.isDefault) ?? resumes[0] ?? null;

  return {
    resumes,
    defaultResume,
    loading,
    error,
    uploadResume,
    removeResume,
    makeDefault,
    previewResume,
    getDefaultResume,
    refresh: loadResumes,
    clearError: () => setError(null),
  };
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(',');
  const mimeMatch = header.match(/:(.*?);/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'application/pdf';
  
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}
