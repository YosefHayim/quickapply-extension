import { useRef, useState } from 'react';
import { ArrowLeft, Plus, FileText, Info, Eye, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useResumes } from '@/hooks/useResumes';
import { formatFileSize, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { ResumeItem } from '@/types/profile';

interface ResumeManagerProps {
  onBack: () => void;
}

export default function ResumeManager({ onBack }: ResumeManagerProps) {
  const { resumes, loading, error, uploadResume, removeResume, makeDefault, previewResume, clearError } = useResumes();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await uploadResume(file);
    } catch (error) {
      console.error('Failed to upload resume:', error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await removeResume(id);
    } catch (error) {
      console.error('Failed to delete resume:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const isEmpty = resumes.length === 0 && !loading;

  return (
    <div className="flex flex-col h-[550px] bg-background">
      <header className="flex items-center justify-between px-4 py-3 border-b shrink-0">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="h-8 w-8 rounded-lg hover:bg-muted"
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-base font-semibold">My Resumes</h1>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="h-8 w-8 rounded-lg hover:bg-muted"
          aria-label="Add resume"
        >
          <Plus className={cn('h-4 w-4', uploading && 'animate-pulse')} />
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleFileSelect}
          className="hidden"
        />
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          <InfoBanner />

          {error && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
              <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
              <Button
                variant="ghost"
                size="icon"
                onClick={clearError}
                className="h-7 w-7 text-red-500 hover:text-red-700 dark:hover:text-red-300"
                aria-label="Dismiss error"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          {loading ? (
            <div className="flex items-center justify-center py-12" role="status" aria-live="polite">
              <span className="sr-only">Loading resumes</span>
              <div className="h-6 w-6 border-2 border-muted-foreground/30 border-t-foreground rounded-full animate-spin" />
            </div>
          ) : isEmpty ? (
            <EmptyState onUpload={() => fileInputRef.current?.click()} uploading={uploading} />
          ) : (
            <div className="space-y-3">
              {resumes.map((resume) => (
                <ResumeCard
                  key={resume.id}
                  resume={resume}
                  onPreview={() => previewResume(resume)}
                  onDelete={() => handleDelete(resume.id)}
                  onSetDefault={() => makeDefault(resume.id)}
                  isDeleting={deletingId === resume.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoBanner() {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-[#EFF6FF] dark:bg-[#1E3A5F]/50">
      <Info className="h-4 w-4 text-[#2563EB] dark:text-[#60A5FA] shrink-0 mt-0.5" />
      <p className="text-xs text-[#1E40AF] dark:text-[#93C5FD] leading-relaxed">
        Upload different resumes for different job types
      </p>
    </div>
  );
}

interface EmptyStateProps {
  onUpload: () => void;
  uploading: boolean;
}

function EmptyState({ onUpload, uploading }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <FileText className="h-7 w-7 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold mb-1">No Resumes Yet</h3>
      <p className="text-xs text-muted-foreground text-center mb-6 max-w-[220px]">
        Upload your first resume to start auto-filling job applications
      </p>
      <Button
        onClick={onUpload}
        disabled={uploading}
        className="h-10 px-6 rounded-lg"
      >
        {uploading ? 'Uploading...' : 'Upload Resume'}
      </Button>
    </div>
  );
}

interface ResumeCardProps {
  resume: ResumeItem;
  onPreview: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
  isDeleting: boolean;
}

function ResumeCard({ resume, onPreview, onDelete, onSetDefault, isDeleting }: ResumeCardProps) {
  const formattedSize = formatFileSize(resume.size);
  const formattedDate = formatDate(resume.date);

  return (
    <div
      className={cn(
        'p-4 rounded-xl transition-all',
        resume.isDefault
          ? 'border-2 border-[#10B981] bg-[#F5F5F5] dark:bg-[#1A1A1A]'
          : 'border border-[#E5E5E5] dark:border-[#333] bg-card'
      )}
    >
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
          <FileText className="h-5 w-5 text-muted-foreground" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium truncate">{resume.name}</span>
            {resume.isDefault && (
              <span className="shrink-0 px-2 py-0.5 text-[10px] font-medium rounded-full bg-[#10B981] text-white">
                Default
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {formattedSize} &middot; {formattedDate}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3">
        <Button
          variant="outline"
          size="sm"
          onClick={onPreview}
          disabled={isDeleting}
          className="h-8 flex-1 text-xs rounded-lg"
        >
          <Eye className="h-3.5 w-3.5 mr-1.5" />
          Preview
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onDelete}
          disabled={isDeleting}
          className="h-8 flex-1 text-xs rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
        >
          <Trash2 className="h-3.5 w-3.5 mr-1.5" />
          {isDeleting ? 'Deleting...' : 'Delete'}
        </Button>
      </div>

      {!resume.isDefault && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onSetDefault}
          disabled={isDeleting}
          className="h-8 w-full mt-2 text-xs rounded-lg text-[#10B981] hover:text-[#10B981] hover:bg-[#10B981]/10"
        >
          Set as Default
        </Button>
      )}
    </div>
  );
}
