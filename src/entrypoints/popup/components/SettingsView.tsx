import { useState, useEffect } from 'react';
import { Download, Upload, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { getSettings, saveSettings, getProfiles } from '@/lib/storage';
import type { ExtensionSettings } from '@/types/profile';

export default function SettingsView() {
  const [settings, setSettings] = useState<ExtensionSettings | null>(null);

  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  const handleSettingChange = async (key: keyof ExtensionSettings, value: boolean) => {
    if (!settings) return;
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const handleExport = async () => {
    const profiles = await getProfiles();
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      profiles,
      settings,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quickapply-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const data = JSON.parse(text);

        if (data.profiles && Array.isArray(data.profiles)) {
          await chrome.storage.local.set({ profiles: data.profiles });
        }
        if (data.settings) {
          await saveSettings(data.settings);
          setSettings(data.settings);
        }

        alert('Import successful!');
      } catch {
        alert('Invalid backup file');
      }
    };
    input.click();
  };

  const handleClearData = async () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      await chrome.storage.local.clear();
      window.location.reload();
    }
  };

  if (!settings) {
    return <div className="text-center text-sm text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-4 max-h-[400px] overflow-y-auto">
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm">Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm">Auto-detect Forms</Label>
              <p className="text-xs text-muted-foreground">
                Automatically detect job application forms
              </p>
            </div>
            <Switch
              checked={settings.autoDetectForms}
              onCheckedChange={(checked) => handleSettingChange('autoDetectForms', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm">Notifications</Label>
              <p className="text-xs text-muted-foreground">
                Show notifications after filling forms
              </p>
            </div>
            <Switch
              checked={settings.showNotifications}
              onCheckedChange={(checked) => handleSettingChange('showNotifications', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm">Data Management</CardTitle>
          <CardDescription className="text-xs">
            Export or import your profile data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" size="sm" className="w-full" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button variant="outline" size="sm" className="w-full" onClick={handleImport}>
            <Upload className="h-4 w-4 mr-2" />
            Import Data
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="w-full"
            onClick={handleClearData}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All Data
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm">About</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>QuickApply v1.0.0</p>
            <p>One-click job application auto-fill</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
