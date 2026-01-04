import { useEffect, useRef, useState } from 'react';
import { AlertCircle, Mic, ShieldAlert, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Checkbox } from '@/components/ui/checkbox';

interface PanicButtonProps {
  onAlert: () => void;
}

export const PanicButton = ({ onAlert }: PanicButtonProps) => {
  const [isPanicRecording, setIsPanicRecording] = useState(false);
  const [isAmberRecording, setIsAmberRecording] = useState(false);
  const [audience, setAudience] = useState(() => localStorage.getItem('audience') || 'nearby');
  const [lowDataMode, setLowDataMode] = useState(() => localStorage.getItem('lowDataMode') === 'true');
  const [recordingTime, setRecordingTime] = useState(0);

  const panicRecorderRef = useRef<MediaRecorder | null>(null);
  const amberRecorderRef = useRef<MediaRecorder | null>(null);
  const panicChunksRef = useRef<Blob[]>([]);
  const amberChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastAlertRef = useRef<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (panicRecorderRef.current?.state !== 'inactive') {
        panicRecorderRef.current?.stop();
      }
      if (amberRecorderRef.current?.state !== 'inactive') {
        amberRecorderRef.current?.stop();
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async (type: 'panic' | 'amber') => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunksRef = type === 'panic' ? panicChunksRef : amberChunksRef;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start(1000);

      if (type === 'panic') {
        panicRecorderRef.current = recorder;
        setIsPanicRecording(true);
      } else {
        amberRecorderRef.current = recorder;
        setIsAmberRecording(true);
      }

      // Start timer
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast({
        title: '🎤 Recording started',
        description: 'Press again to stop and send alert',
      });
    } catch (err) {
      console.error('Audio recording error:', err);
      toast({
        title: 'Microphone blocked',
        description: 'Enable microphone to capture emergency audio.',
        variant: 'destructive',
      });
    }
  };

  const stopRecordingAndSend = async (type: 'panic' | 'amber') => {
    const recorder = type === 'panic' ? panicRecorderRef.current : amberRecorderRef.current;
    const chunksRef = type === 'panic' ? panicChunksRef : amberChunksRef;

    if (!recorder || recorder.state === 'inactive') return;

    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Stop recording
    recorder.stop();

    if (type === 'panic') {
      setIsPanicRecording(false);
    } else {
      setIsAmberRecording(false);
    }

    // Wait a bit for the last data chunk
    await new Promise(resolve => setTimeout(resolve, 100));

    // Create blob
    const blob = new Blob(chunksRef.current, { type: 'audio/webm' });

    // Upload and send alert
    await sendAlert(type, blob);
  };

  const uploadAudio = async (blob: Blob): Promise<string | null> => {
    try {
      const filename = `audio-${Date.now()}.webm`;
      const { data, error } = await supabase.storage
        .from('incident-media')
        .upload(filename, blob, {
          contentType: 'audio/webm',
          upsert: false,
        });

      if (error) throw error;

      const { data: pub } = supabase.storage
        .from('incident-media')
        .getPublicUrl(filename);

      return pub?.publicUrl || null;
    } catch (e) {
      console.warn('Audio upload failed:', e);
      return null;
    }
  };

  const reverseGeocode = async (lng: number, lat: number): Promise<string | null> => {
    try {
      const token = import.meta.env.VITE_MAPBOX_TOKEN;
      if (!token) return null;
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}`;
      const res = await fetch(url);
      if (!res.ok) return null;
      const data = await res.json();
      return data?.features?.[0]?.place_name || null;
    } catch {
      return null;
    }
  };

  const sendAlert = async (type: 'panic' | 'amber', audioBlob: Blob) => {
    // Cooldown check
    const now = Date.now();
    if (lastAlertRef.current && now - lastAlertRef.current < 15000) {
      toast({
        title: 'On cooldown',
        description: 'Please wait before sending another alert.',
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: 'Not authenticated',
        description: 'Please sign in to send alerts',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: '📤 Sending alert...',
      description: 'Uploading audio and location data',
    });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const placeName = lowDataMode ? null : await reverseGeocode(longitude, latitude);
          const audioUrl = await uploadAudio(audioBlob);
          const audienceLabel = audience === 'contacts' ? 'contacts' : audience === 'public' ? 'public feed' : 'nearby users';
          const description = type === 'panic'
            ? `Emergency — need help (sent to ${audienceLabel})`
            : `Amber Alert — need assistance (sent to ${audienceLabel})`;

          const { error } = await supabase.from('alerts').insert({
            user_id: user.id,
            alert_type: type,
            location: `POINT(${longitude} ${latitude})`,
            location_name: placeName || 'Current Location',
            audio_url: audioUrl || null,
            description,
          });

          if (error) throw error;

          lastAlertRef.current = now;

          toast({
            title: type === 'panic' ? '🚨 PANIC ALERT SENT' : '🟠 AMBER ALERT SENT',
            description: `Alert sent to ${audienceLabel}. Stay safe!`,
          });

          onAlert();

          if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
          }
        } catch (error) {
          console.error('Error sending alert:', error);
          toast({
            title: 'Failed to send alert',
            description: 'Please try again',
            variant: 'destructive'
          });
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast({
          title: 'Location access denied',
          description: 'Enable location to send alerts',
          variant: 'destructive'
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handlePanicPress = async () => {
    if (isPanicRecording) {
      await stopRecordingAndSend('panic');
    } else {
      await startRecording('panic');
    }
  };

  const handleAmberPress = async () => {
    if (isAmberRecording) {
      await stopRecordingAndSend('amber');
    } else {
      await startRecording('amber');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-2">
        <label className="text-sm text-muted-foreground">
          Share with
          <select
            className="ml-2 border border-input rounded-md bg-background text-sm px-2 py-1"
            value={audience}
            onChange={(e) => {
              setAudience(e.target.value);
              localStorage.setItem('audience', e.target.value);
            }}
          >
            <option value="nearby">Nearby users</option>
            <option value="contacts">Emergency contacts</option>
            <option value="public">Public feed</option>
          </select>
        </label>
        <div className="flex items-center gap-2">
          <Checkbox
            checked={lowDataMode}
            onCheckedChange={(v) => {
              const on = Boolean(v);
              setLowDataMode(on);
              localStorage.setItem('lowDataMode', on ? 'true' : 'false');
            }}
          />
          <span className="text-sm text-muted-foreground">Low-data mode</span>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-4">
        <Button
          size="lg"
          onClick={handlePanicPress}
          className={`
            relative h-40 w-40 rounded-full text-xl font-bold
            transition-all duration-300
            ${isPanicRecording
              ? 'bg-red-700 animate-pulse shadow-glow-intense'
              : 'bg-gradient-emergency hover:scale-105'
            }
          `}
        >
          <div className="flex flex-col items-center gap-1">
            {isPanicRecording ? (
              <>
                <Square className="h-14 w-14" />
                <span className="text-sm">STOP</span>
                <span className="text-xs">{formatTime(recordingTime)}</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-14 w-14" />
                <span>PANIC</span>
              </>
            )}
          </div>
        </Button>

        <Button
          size="lg"
          onClick={handleAmberPress}
          className={`
            relative h-40 w-40 rounded-full text-xl font-bold text-white
            transition-all duration-300
            ${isAmberRecording
              ? 'bg-amber-700 animate-pulse shadow-lg'
              : 'bg-amber-500 hover:scale-105'
            }
          `}
        >
          <div className="flex flex-col items-center gap-1">
            {isAmberRecording ? (
              <>
                <Square className="h-14 w-14" />
                <span className="text-sm">STOP</span>
                <span className="text-xs">{formatTime(recordingTime)}</span>
              </>
            ) : (
              <>
                <ShieldAlert className="h-14 w-14" />
                <span>AMBER</span>
              </>
            )}
          </div>
        </Button>
      </div>

      <p className="text-sm text-muted-foreground max-w-xs text-center">
        {isPanicRecording || isAmberRecording
          ? '🎤 Recording... Press again to stop and send alert'
          : 'Press once to start recording. Press again to stop and send.'}
      </p>
    </div>
  );
};
