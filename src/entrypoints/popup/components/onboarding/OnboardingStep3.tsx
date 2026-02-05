import { useState, useRef, useCallback } from 'react';
import { Upload, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { StoredFile } from '@/types/profile';
import { fileToBase64, formatFileSize } from '@/lib/utils';

interface OnboardingStep3Props {
  resumeFile: StoredFile | null;
  onSetResume: (file: StoredFile | null) => void;
  onComplete: () => void;
  onBack: () => void;
  saveError?: string | null;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export default function OnboardingStep3({
  resumeFile,
  onSetResume,
  onComplete,
  onBack,
  saveError,
}: OnboardingStep3Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback(async (file: File): Promise<string | null> => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Please upload a PDF, DOC, or DOCX file';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 5MB';
    }

    const headerSlice = file.slice(0, 8);
    const buffer = await headerSlice.arrayBuffer();
    const headerBytes = new Uint8Array(buffer);

    const isPdf =
      headerBytes.length >= 4 &&
      headerBytes[0] === 0x25 &&
      headerBytes[1] === 0x50 &&
      headerBytes[2] === 0x44 &&
      headerBytes[3] === 0x46;

    const isDoc =
      headerBytes.length >= 8 &&
      headerBytes[0] === 0xd0 &&
      headerBytes[1] === 0xcf &&
      headerBytes[2] === 0x11 &&
      headerBytes[3] === 0xe0 &&
      headerBytes[4] === 0xa1 &&
      headerBytes[5] === 0xb1 &&
      headerBytes[6] === 0x1a &&
      headerBytes[7] === 0xe1;

    const isDocx =
      headerBytes.length >= 4 &&
      headerBytes[0] === 0x50 &&
      headerBytes[1] === 0x4b &&
      headerBytes[2] === 0x03 &&
      headerBytes[3] === 0x04;

    if (!isPdf && !isDoc && !isDocx) {
      return 'File content does not match a valid PDF, DOC, or DOCX file';
    }

    return null;
  }, []);

  const handleFile = useCallback(async (file: File) => {
    const validationError = await validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsProcessing(true);
    try {
      const base64 = await fileToBase64(file);
      const storedFile: StoredFile = {
        name: file.name,
        type: file.type,
        size: file.size,
        data: base64,
        lastModified: file.lastModified,
      };
      onSetResume(storedFile);
    } finally {
      setIsProcessing(false);
    }
  }, [validateFile, onSetResume]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (isProcessing) {
      return;
    }

    if (!Array.from(e.dataTransfer.types).includes('Files')) {
      return;
    }

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile, isProcessing]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (isProcessing) {
      return;
    }
    if (!Array.from(e.dataTransfer.types).includes('Files')) {
      return;
    }
    if (error) {
      setError(null);
    }
    setIsDragging(true);
  }, [error, isProcessing]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleContainerClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('button')) {
      return;
    }
    handleBrowseClick();
  };

  return (
    <div className="flex flex-col h-full px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold text-foreground">Upload Resume</h1>
        <span className="text-sm text-muted-foreground">Step 3 of 3</span>
      </div>

      <div className="flex-1 flex flex-col">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleContainerClick}
          onKeyDown={(event) => {
            if ((event.target as HTMLElement).closest('button')) {
              return;
            }
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              handleBrowseClick();
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Upload your resume by dropping a file here or browsing your files"
          aria-busy={isProcessing}
          className={`
            h-[180px] rounded-xl border-2 border-dashed transition-colors
            flex flex-col items-center justify-center gap-3 cursor-pointer
            ${isDragging 
              ? 'border-primary bg-primary/5' 
              : 'border-border hover:border-muted-foreground/50'
            }
            ${resumeFile ? 'bg-secondary/50' : ''}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileSelect}
            className="hidden"
            aria-label="Upload resume file"
          />
          
          {isProcessing ? (
            <>
              <div className="h-8 w-8 rounded-full border-2 border-muted-foreground/30 border-t-foreground animate-spin" />
              <p className="text-sm text-muted-foreground">Processing file...</p>
            </>
          ) : resumeFile ? (
            <>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground truncate max-w-[250px]">
                  {resumeFile.name}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatFileSize(resumeFile.size)}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={(e) => {
                  onSetResume(null);
                }}
                disabled={isProcessing}
              >
                Remove
              </Button>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                <Upload className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  Drop your resume here
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  PDF, DOC, or DOCX (max 5MB)
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-8 text-xs"
                onClick={(e) => {
                  handleBrowseClick();
                }}
                disabled={isProcessing}
              >
                Browse Files
              </Button>
            </>
          )}
        </div>

        {error && (
          <p className="text-xs text-destructive mt-2 text-center">{error}</p>
        )}
        {saveError && (
          <p className="text-xs text-destructive mt-2 text-center">{saveError}</p>
        )}

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">or import from</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full h-11 gap-2"
          disabled
        >
          <Linkedin className="w-4 h-4" />
          Import from LinkedIn (coming soon)
        </Button>
      </div>

      <div className="space-y-4 mt-6">
        <div className="flex gap-3">
          <Button
            type="button"
            variant="ghost"
            className="flex-1 h-11"
            onClick={onBack}
          >
            Back
          </Button>
          <Button 
            type="button" 
            className="flex-1 h-11"
            onClick={onComplete}
            disabled={isProcessing}
          >
            Complete Setup
          </Button>
        </div>

        <div className="flex items-center justify-center gap-2">
          <span className="sr-only">Step 3 of 3</span>
          <div className="w-2 h-2 rounded-full bg-border" />
          <div className="w-2 h-2 rounded-full bg-border" />
          <div className="w-2 h-2 rounded-full bg-primary" />
        </div>
      </div>
    </div>
  );
}
