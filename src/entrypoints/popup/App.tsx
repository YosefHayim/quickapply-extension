import { useState, useEffect } from 'react';
import { Moon, Sun, Settings, Zap, FileText, User, CreditCard, LogOut, History, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme } from '@/hooks/useTheme';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { useUserStatus } from '@/hooks/useUserStatus';
import { useOnboarding } from '@/hooks/useOnboarding';
import { calculateProfileCompletion } from '@/lib/utils';
import ProfileEditor from './components/ProfileEditor';
import PricingView from './components/PricingView';
import SettingsView from './components/SettingsView';
import AuthPrompt from './components/AuthPrompt';
import StatusBanner from './components/StatusBanner';
import ResumeManager from './components/ResumeManager';
import ApplicationHistory from './components/ApplicationHistory';
import { Onboarding } from './components/onboarding';

const MAX_DISPLAYED_MISSING_FIELDS = 3;

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const { profile, profiles, loading: profileLoading, switchProfile, saveProfile } = useProfile();
  const { isAuthenticated, isLoading: authLoading, login, logout } = useAuth();
  const { status } = useUserStatus();
  const onboarding = useOnboarding();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [fillStatus, setFillStatus] = useState<{ filled: number; total: number } | null>(null);
  const [showResumeManager, setShowResumeManager] = useState(false);
  const [isJobPage, setIsJobPage] = useState<boolean | null>(null);

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
      if (!tab?.id) return;
      chrome.tabs.sendMessage(tab.id, { action: 'check-page' })
        .then((res: { isJobPage: boolean } | undefined) => {
          setIsJobPage(res?.isJobPage ?? false);
        })
        .catch(() => setIsJobPage(false));
    });
  }, []);

  const handleFillForm = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) return;

      const detectResult = await chrome.tabs.sendMessage(tab.id, { action: 'detect-fields' });
      setFillStatus({ filled: 0, total: detectResult.count });

      await chrome.tabs.sendMessage(tab.id, { action: 'fill-form' });

      setFillStatus({ filled: detectResult.count, total: detectResult.count });

      setTimeout(() => setFillStatus(null), 3000);
    } catch (error) {
      console.error('Failed to fill form:', error);
    }
  };

  const isSubscribed = status?.subscription.isActive ?? false;

  if (authLoading || onboarding.isLoading) {
    return (
      <div className="w-[400px] min-h-[500px] flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPrompt onLogin={login} />;
  }

  if (!onboarding.isCompleted) {
    return <Onboarding onboarding={onboarding} onComplete={() => {}} />;
  }

  if (profileLoading) {
    return (
      <div className="w-[400px] min-h-[500px] flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (showResumeManager) {
    return <ResumeManager onBack={() => setShowResumeManager(false)} />;
  }

  return (
    <div className="w-[400px] min-h-[500px] bg-background text-foreground flex flex-col">
      <header className="flex items-center justify-between p-4 border-b shrink-0">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          <span className="font-semibold">QuickApply</span>
          {isSubscribed && (
            <Badge className="text-xs bg-gradient-to-r from-violet-500 to-purple-500 text-white border-0">
              Pro
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={logout} title="Sign out">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {status && <StatusBanner status={status} onUpgrade={() => setActiveTab('pricing')} />}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="p-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">
            <Zap className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="profile">
            <User className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="pricing">
            <CreditCard className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4" />
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4 mt-4">
          {isJobPage !== null && (
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${
                isJobPage
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {isJobPage ? (
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              ) : (
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              )}
              {isJobPage
                ? 'Job application page detected — ready to fill!'
                : 'Navigate to a job application page to fill'}
            </div>
          )}

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <span>Active Profile</span>
                {profiles.length > 1 && (
                  <select
                    className="text-xs bg-transparent border rounded px-2 py-1"
                    value={profile?.id}
                    onChange={(e) => switchProfile(e.target.value)}
                  >
                    {profiles.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">{profile?.name || 'No Profile'}</div>
              <div className="text-sm text-muted-foreground">
                {profile?.personal.firstName} {profile?.personal.lastName}
              </div>
              {profile?.files.resume && (
                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                  <FileText className="h-3 w-3" />
                  {profile.files.resume.name}
                </div>
              )}
              {profile && (() => {
                const { percentage, missingFields } = calculateProfileCompletion(profile);
                return (
                  <div className="mt-3 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Profile completeness</span>
                      <span className={`font-medium ${percentage === 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                        {percentage}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${percentage === 100 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    {missingFields.length > 0 && (
                      <p className="text-[10px] text-muted-foreground">
                        Missing: {missingFields.slice(0, MAX_DISPLAYED_MISSING_FIELDS).join(', ')}{missingFields.length > MAX_DISPLAYED_MISSING_FIELDS ? ` +${missingFields.length - MAX_DISPLAYED_MISSING_FIELDS} more` : ''}
                      </p>
                    )}
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          <Button className="w-full h-12 text-base" onClick={handleFillForm}>
            <Zap className="h-5 w-5 mr-2" />
            Fill This Form
          </Button>

          {fillStatus && (
            <Card>
              <CardContent className="py-3">
                <div className="text-center text-sm">
                  Filled {fillStatus.filled} of {fillStatus.total} fields
                </div>
              </CardContent>
            </Card>
          )}

          <div className="text-xs text-center text-muted-foreground">
            Keyboard: <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl+Shift+F</kbd>
          </div>
        </TabsContent>

        <TabsContent value="profile" className="mt-4">
          {profile && (
            <ProfileEditor
              profile={profile}
              onSave={saveProfile}
              onOpenResumeManager={() => setShowResumeManager(true)}
            />
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <ApplicationHistory onBack={() => setActiveTab('dashboard')} />
        </TabsContent>

        <TabsContent value="pricing" className="mt-4">
          <PricingView />
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <SettingsView />
        </TabsContent>
      </Tabs>
    </div>
  );
}
