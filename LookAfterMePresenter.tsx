import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, Home, MapPin, Users, Timer, Shield, Plus } from 'lucide-react';
import CheckInReminder from '@/components/CheckInReminder';
import { Navigation } from '@/components/Navigation';
import type { TrackingSession, Watcher } from '@/hooks/use-look-after-me';

interface LookAfterMePresenterProps {
  activeSession: TrackingSession | null;
  watchers: Watcher[];
  loading: boolean;
  currentLocation: GeolocationPosition | null;
  onCheckIn: () => void;
  onEndSession: () => void;
  onEmergency: () => void;
}

export function LookAfterMePresenter({
  activeSession,
  watchers,
  loading,
  currentLocation,
  onCheckIn,
  onEndSession,
  onEmergency,
}: LookAfterMePresenterProps) {
  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="bg-card border-b border-border p-4 sticky top-0 z-10">
          <div className="max-w-lg mx-auto flex items-center gap-2">
            <Eye className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Look After Me</h1>
          </div>
        </header>
        <div className="flex items-center justify-center p-12">
          <div className="animate-pulse text-primary">Loading...</div>
        </div>
        <Navigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-card border-b border-border p-4 sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center gap-2">
          <Eye className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">Look After Me</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4 space-y-6">
        <h2 className="text-lg font-semibold">
          Share your journey with trusted contacts. They'll know you're safe when you check in.
        </h2>

        {activeSession ? (
          <>
            {/* Active Session Status Banner */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-lg shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 bg-white rounded-full animate-pulse" />
                  <div>
                    <div className="text-sm font-medium opacity-90">Session Active</div>
                    <div className="text-xs opacity-75">
                      {watchers.length} {watchers.length === 1 ? 'person is' : 'people are'} watching over you
                    </div>
                  </div>
                </div>
                <Shield className="h-8 w-8 opacity-80" />
              </div>
            </div>

            {/* Destination Card */}
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-card to-card/50">
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    HEADING TO
                  </div>
                  <h3 className="text-3xl font-bold text-foreground">{activeSession.destination_name}</h3>
                  {currentLocation && (
                    <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                      <MapPin className="h-4 w-4" />
                      <span className="font-medium">Location tracking active</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Timer className="h-3 w-3" />
                      Started
                    </div>
                    <div className="font-semibold text-sm">
                      {new Date(activeSession.started_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Timer className="h-3 w-3" />
                      Expected Arrival
                    </div>
                    <div className="font-semibold text-sm">
                      {new Date(activeSession.estimated_arrival).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Check-in Reminder */}
            <CheckInReminder
              startTime={activeSession.started_at}
              estimatedArrival={activeSession.estimated_arrival}
              onCheckIn={onCheckIn}
            />

            {/* Watchers List */}
            <Card className="border-border">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="font-semibold flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    People Watching Over You ({watchers.length})
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {watchers.map((watcher) => (
                      <div
                        key={watcher.id}
                        className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-2 rounded-lg border border-primary/20"
                      >
                        <div className="h-2 w-2 bg-green-500 rounded-full" />
                        <span className="font-medium text-sm">{watcher.full_name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* Primary Check-in Button */}
              <Button
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg"
                onClick={onCheckIn}
              >
                <Shield className="h-5 w-5 mr-2" />
                I'm Safe - Check In Now
              </Button>

              {/* Emergency Button */}
              <Button
                variant="destructive"
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg"
                onClick={onEmergency}
              >
                <Shield className="h-5 w-5 mr-2" />
                🚨 EMERGENCY - Send Alert
              </Button>

              {/* End Session Button */}
              <Button
                variant="outline"
                className="w-full"
                onClick={onEndSession}
              >
                End Session Safely
              </Button>
            </div>

            {/* Safety Tips */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                Tips for Safe Travel
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Share your live location with watchers</li>
                <li>• Check in regularly during your journey</li>
                <li>• Keep your phone charged and with you</li>
                <li>• Use Emergency button if you need immediate help</li>
              </ul>
            </div>
          </>
        ) : (
          <>
            {/* No Active Session */}
            <Card className="border-2 border-dashed border-border">
              <CardContent className="p-8 text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Eye className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">No Active Session</h3>
                  <p className="text-muted-foreground">
                    Start a new session to let your trusted contacts know where you're going
                  </p>
                </div>
                <Button
                  className="w-full h-12 text-lg font-semibold"
                  onClick={() => window.location.href = '/start-session'}
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Start New Session
                </Button>
              </CardContent>
            </Card>

            {/* How It Works */}
            <Card className="border-border bg-muted/30">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-lg">How Look After Me Works</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xs">
                      1
                    </div>
                    <div>
                      <div className="font-medium">Share Your Journey</div>
                      <div className="text-muted-foreground">Tell us where you're going and when you'll arrive</div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xs">
                      2
                    </div>
                    <div>
                      <div className="font-medium">Select Watchers</div>
                      <div className="text-muted-foreground">Choose trusted contacts to watch over you</div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xs">
                      3
                    </div>
                    <div>
                      <div className="font-medium">Check In Safely</div>
                      <div className="text-muted-foreground">Let them know you've arrived safely</div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center font-bold text-xs">
                      !
                    </div>
                    <div>
                      <div className="font-medium">Emergency Alert</div>
                      <div className="text-muted-foreground">If you don't check in, watchers are automatically notified</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>

      <Navigation />
    </div>
  );
}