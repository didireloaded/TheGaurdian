import { useEffect, useState } from 'react';
import { Bell, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface CheckInReminderProps {
  startTime: string;
  estimatedArrival: string | null;
  onCheckIn: () => void;
}

const CheckInReminder = ({ startTime, estimatedArrival, onCheckIn }: CheckInReminderProps) => {
  const [timeElapsed, setTimeElapsed] = useState('');
  const [shouldRemind, setShouldRemind] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const updateTimeElapsed = () => {
      const start = new Date(startTime).getTime();
      const now = new Date().getTime();
      const elapsed = now - start;

      // Format elapsed time
      const hours = Math.floor(elapsed / (1000 * 60 * 60));
      const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
      setTimeElapsed(`${hours}h ${minutes}m`);

      // Check if we should remind (every 30 minutes after first hour)
      if (elapsed > 3600000 && elapsed % 1800000 < 10000) {
        setShouldRemind(true);
        toast({
          title: "Time to Check In",
          description: "Please confirm you're safe by checking in.",
          duration: 10000,
        });
      }
    };

    const interval = setInterval(updateTimeElapsed, 10000);
    return () => clearInterval(interval);
  }, [startTime, toast]);

  const getTimeRemaining = () => {
    if (!estimatedArrival) return null;
    const arrival = new Date(estimatedArrival).getTime();
    const now = new Date().getTime();
    const remaining = arrival - now;

    if (remaining <= 0) return 'Overdue';

    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const timeRemaining = getTimeRemaining();

  return (
    <Card className={`p-4 ${shouldRemind ? 'bg-yellow-500/10 border-yellow-500' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <Clock className="h-4 w-4" />
            Journey Duration
          </div>
          <div className="font-medium">{timeElapsed}</div>
          {timeRemaining && (
            <div className="text-sm text-muted-foreground">
              {timeRemaining === 'Overdue' ? (
                <span className="text-destructive">Check in overdue!</span>
              ) : (
                `${timeRemaining} until estimated arrival`
              )}
            </div>
          )}
        </div>
        {shouldRemind && (
          <Button
            variant="outline"
            className="bg-yellow-500/10 border-yellow-500 text-yellow-500 hover:bg-yellow-500/20"
            onClick={onCheckIn}
          >
            <Bell className="h-4 w-4 mr-2" />
            Check In Now
          </Button>
        )}
      </div>
    </Card>
  );
};

export default CheckInReminder;