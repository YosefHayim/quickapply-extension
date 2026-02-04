import { useState } from 'react';
import { Save, Upload, X, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import type { UserProfile, StoredFile } from '@/types/profile';
import { fileToBase64, formatFileSize } from '@/lib/utils';

interface ProfileEditorProps {
  profile: UserProfile;
  onSave: (profile: UserProfile) => Promise<void>;
}

export default function ProfileEditor({ profile, onSave }: ProfileEditorProps) {
  const [formData, setFormData] = useState({
    ...profile,
    customFields: profile.customFields || {},
  });
  const [saving, setSaving] = useState(false);
  const [newFieldKey, setNewFieldKey] = useState('');
  const [newFieldValue, setNewFieldValue] = useState('');

  const handleChange = (path: string, value: string | boolean | number) => {
    setFormData((prev) => {
      const keys = path.split('.');
      const newData = { ...prev };
      let current: Record<string, unknown> = newData;

      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...(current[keys[i]] as Record<string, unknown>) };
        current = current[keys[i]] as Record<string, unknown>;
      }

      current[keys[keys.length - 1]] = value;
      return newData as UserProfile;
    });
  };

  const handleFileUpload = async (type: 'resume' | 'coverLetter', file: File) => {
    const base64 = await fileToBase64(file);
    const storedFile: StoredFile = {
      name: file.name,
      type: file.type,
      size: file.size,
      data: base64,
      lastModified: file.lastModified,
    };

    setFormData((prev) => ({
      ...prev,
      files: {
        ...prev.files,
        [type]: storedFile,
      },
    }));
  };

  const handleRemoveFile = (type: 'resume' | 'coverLetter') => {
    setFormData((prev) => ({
      ...prev,
      files: {
        ...prev.files,
        [type]: undefined,
      },
    }));
  };

  const handleAddCustomField = () => {
    const key = newFieldKey.trim();
    if (!key) return;
    
    setFormData((prev) => ({
      ...prev,
      customFields: {
        ...prev.customFields,
        [key]: newFieldValue,
      },
    }));
    setNewFieldKey('');
    setNewFieldValue('');
  };

  const handleRemoveCustomField = (key: string) => {
    setFormData((prev) => {
      const { [key]: _, ...rest } = prev.customFields;
      return { ...prev, customFields: rest };
    });
  };

  const handleUpdateCustomField = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      customFields: {
        ...prev.customFields,
        [key]: value,
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(formData);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 max-h-[400px] overflow-y-auto">
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">First Name</Label>
              <Input
                value={formData.personal.firstName}
                onChange={(e) => handleChange('personal.firstName', e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">Last Name</Label>
              <Input
                value={formData.personal.lastName}
                onChange={(e) => handleChange('personal.lastName', e.target.value)}
                className="h-8 text-sm"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs">Email</Label>
            <Input
              type="email"
              value={formData.personal.email}
              onChange={(e) => handleChange('personal.email', e.target.value)}
              className="h-8 text-sm"
            />
          </div>

          <div>
            <Label className="text-xs">Phone</Label>
            <Input
              type="tel"
              value={formData.personal.phone}
              onChange={(e) => handleChange('personal.phone', e.target.value)}
              className="h-8 text-sm"
            />
          </div>

          <div>
            <Label className="text-xs">LinkedIn URL</Label>
            <Input
              type="url"
              value={formData.personal.linkedinUrl}
              onChange={(e) => handleChange('personal.linkedinUrl', e.target.value)}
              className="h-8 text-sm"
              placeholder="https://linkedin.com/in/..."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm">Work Authorization</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="authorizedToWork"
              checked={formData.workAuth.authorizedToWork}
              onCheckedChange={(checked) =>
                handleChange('workAuth.authorizedToWork', checked === true)
              }
            />
            <Label htmlFor="authorizedToWork" className="text-xs">
              Authorized to work in the US
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="requiresSponsorship"
              checked={formData.workAuth.requiresSponsorship}
              onCheckedChange={(checked) =>
                handleChange('workAuth.requiresSponsorship', checked === true)
              }
            />
            <Label htmlFor="requiresSponsorship" className="text-xs">
              Requires visa sponsorship
            </Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm">Experience</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs">Years of Experience</Label>
            <Input
              type="number"
              value={formData.experience.totalYears}
              onChange={(e) => handleChange('experience.totalYears', parseInt(e.target.value) || 0)}
              className="h-8 text-sm"
              min={0}
            />
          </div>

          <div>
            <Label className="text-xs">Current Title</Label>
            <Input
              value={formData.experience.currentTitle}
              onChange={(e) => handleChange('experience.currentTitle', e.target.value)}
              className="h-8 text-sm"
            />
          </div>

          <div>
            <Label className="text-xs">Current Company</Label>
            <Input
              value={formData.experience.currentCompany}
              onChange={(e) => handleChange('experience.currentCompany', e.target.value)}
              className="h-8 text-sm"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm">Documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs">Resume (PDF)</Label>
            {formData.files.resume ? (
              <div className="flex items-center justify-between p-2 bg-muted rounded mt-1">
                <span className="text-xs truncate flex-1">
                  {formData.files.resume.name} ({formatFileSize(formData.files.resume.size)})
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleRemoveFile('resume')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <label className="flex items-center justify-center p-3 border-2 border-dashed rounded cursor-pointer hover:bg-muted/50 mt-1">
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload('resume', file);
                  }}
                />
                <Upload className="h-4 w-4 mr-2" />
                <span className="text-xs">Upload Resume</span>
              </label>
            )}
          </div>

          <div>
            <Label className="text-xs">Cover Letter (Optional)</Label>
            {formData.files.coverLetter ? (
              <div className="flex items-center justify-between p-2 bg-muted rounded mt-1">
                <span className="text-xs truncate flex-1">
                  {formData.files.coverLetter.name} ({formatFileSize(formData.files.coverLetter.size)})
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleRemoveFile('coverLetter')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <label className="flex items-center justify-center p-3 border-2 border-dashed rounded cursor-pointer hover:bg-muted/50 mt-1">
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload('coverLetter', file);
                  }}
                />
                <Upload className="h-4 w-4 mr-2" />
                <span className="text-xs">Upload Cover Letter</span>
              </label>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm">Custom Fields</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(formData.customFields).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <Label className="text-xs text-muted-foreground">{key}</Label>
                <Input
                  value={value}
                  onChange={(e) => handleUpdateCustomField(key, e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 mt-4 shrink-0"
                onClick={() => handleRemoveCustomField(key)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
          
          <div className="border-t pt-3 mt-3">
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Field name"
                  value={newFieldKey}
                  onChange={(e) => setNewFieldKey(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              <div className="flex-1">
                <Input
                  placeholder="Value"
                  value={newFieldValue}
                  onChange={(e) => setNewFieldValue(e.target.value)}
                  className="h-8 text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCustomField()}
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={handleAddCustomField}
                disabled={!newFieldKey.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button className="w-full" onClick={handleSave} disabled={saving}>
        <Save className="h-4 w-4 mr-2" />
        {saving ? 'Saving...' : 'Save Profile'}
      </Button>
    </div>
  );
}
