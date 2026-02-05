import { useState, useEffect, useCallback } from 'react';
import {
  getResumes,
  addResume,
  deleteResume,
  setDefaultResume,
  onStorageChange,
  STORAGE_KEYS,
} from '@/lib/storage';
import { base64ToFile, fileToBase64, generateId } from '@/lib/utils';
import type { ResumeItem } from '@/types/profile';

const MAX_FILE_SIZE_MB = 3.5;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;
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
      const normalized = data.map((resume) => ({
        ...resume,
        data:
          resume.data ??
          (resume as ResumeItem & { dataUrl?: string }).dataUrl ??
          '',
      }));
      setResumes(normalized);
      setError(null);
    } catch (err) {
      console.error('Failed to load resumes:', err);
      setError('Failed to load resumes');
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
      return `File size must be less than ${MAX_FILE_SIZE_MB}MB`;
    }
    return null;
  }, []);

  const uploadResume = useCallback(async (file: File): Promise<ResumeItem> => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      throw new Error(validationError);
    }

    try {
      const [data, existingResumes] = await Promise.all([fileToBase64(file), getResumes()]);
      const isFirst = existingResumes.length === 0;

      const resume: ResumeItem = {
        id: generateId(),
        name: file.name,
        size: file.size,
        date: Date.now(),
        isDefault: isFirst,
        data,
        mimeType: file.type || 'application/pdf',
      };

      await addResume(resume);
      setError(null);
      return resume;
    } catch (err) {
      console.error('Failed to upload resume:', err);
      setError('Failed to upload resume');
      throw err;
    }
  }, [validateFile]);

  const removeResume = useCallback(async (id: string) => {
    try {
      await deleteResume(id);
    } catch (err) {
      console.error('Failed to delete resume:', err);
      setError('Failed to delete resume');
      throw err;
    }
  }, []);

  const makeDefault = useCallback(async (id: string) => {
    try {
      await setDefaultResume(id);
    } catch (err) {
      console.error('Failed to set default resume:', err);
      setError('Failed to set default resume');
      throw err;
    }
  }, []);

  const previewResume = useCallback((resume: ResumeItem) => {
    try {
      const base64 = extractBase64(resume.data);
      const file = base64ToFile(base64, resume.name, resume.mimeType);
      const url = URL.createObjectURL(file);
      const previewWindow = window.open(url, '_blank');
      const cleanup = () => URL.revokeObjectURL(url);
      if (previewWindow) {
        previewWindow.addEventListener('beforeunload', cleanup);
      }
      setTimeout(cleanup, 30000);
    } catch (err) {
      console.error('Failed to preview resume:', err);
      setError('Failed to preview resume');
    }
  }, []);

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
    refresh: loadResumes,
    clearError: () => setError(null),
  };
}

function extractBase64(data: string): string {
  if (!data) {
    throw new Error('Missing resume data');
  }
  if (data.startsWith('data:')) {
    const parts = data.split(',');
    if (parts.length < 2 || !parts[1]) {
      throw new Error('Invalid data URL');
    }
    return parts[1];
  }

  return data;
}
