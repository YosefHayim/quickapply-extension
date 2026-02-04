import { useState } from 'react';
import { Moon, Sun, Settings, Zap, FileText, User, CreditCard, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme } from '@/hooks/useTheme';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { useUserStatus } from '@/hooks/useUserStatus';
import ProfileEditor from './components/ProfileEditor';
import PricingView from './components/PricingView';
import SettingsView from './components/SettingsView';
import AuthPrompt from './components/AuthPrompt';
import StatusBanner from './components/StatusBanner';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const { profile, profiles, loading: profileLoading, switchProfile, saveProfile } = useProfile();
  const { user, isAuthenticated, isLoading: authLoading, login, logout } = useAuth();
  const { status } = useUserStatus();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [fillStatus, setFillStatus] = useState<{ filled: number; total: number } | null>(null);

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

  if (authLoading) {
    return (
      <div className="w-[400px] min-h-[500px] flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPrompt onLogin={login} />;
  }

  if (profileLoading) {
    return (
      <div className="w-[400px] min-h-[500px] flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">
            <Zap className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="profile">
            <User className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="pricing">
            <CreditCard className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4" />
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4 mt-4">
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
          {profile && <ProfileEditor profile={profile} onSave={saveProfile} />}
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
