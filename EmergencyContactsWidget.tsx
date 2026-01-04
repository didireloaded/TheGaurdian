import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Phone, MessageSquare, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Contacts {
  emergency_contact_1?: string | null;
  emergency_contact_2?: string | null;
  emergency_contact_3?: string | null;
}

const sanitizePhone = (num: string) => num.replace(/\s+/g, '');

export const EmergencyContactsWidget = () => {
  const [contacts, setContacts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const fetchContacts = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsAuthed(false);
        setContacts([]);
        setLoading(false);
        return;
      }
      setIsAuthed(true);
      const { data } = await supabase
        .from('profiles')
        .select('emergency_contact_1, emergency_contact_2, emergency_contact_3')
        .eq('id', user.id)
        .single();
      const c = data as Contacts | null;
      const list = [c?.emergency_contact_1, c?.emergency_contact_2, c?.emergency_contact_3]
        .filter(Boolean)
        .map((n) => sanitizePhone(n as string));
      setContacts(list);
      setLoading(false);
    };

    fetchContacts();
  }, []);

  const callContact = (num: string) => {
    window.location.href = `tel:${num}`;
  };

  const smsContact = (num: string) => {
    const body = encodeURIComponent('Emergency — need help.');
    window.location.href = `sms:${num}?body=${body}`;
  };

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-4">
        <p className="text-sm text-muted-foreground">Loading contacts…</p>
      </div>
    );
  }

  if (!isAuthed) {
    return (
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center gap-2">
          <UserPlus className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Sign in to add emergency contacts</p>
        </div>
        <div className="mt-3">
          <a href="/auth" className="text-sm underline">Go to Sign In</a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">Emergency Contacts</h3>
        <a href="/profile" className="text-xs underline text-muted-foreground">Manage</a>
      </div>

      {contacts.length === 0 ? (
        <div className="text-sm text-muted-foreground">
          No contacts added. Add them in your profile.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2">
          {contacts.map((num, idx) => (
            <div key={idx} className="flex items-center justify-between rounded-md border border-border p-2">
              <span className="text-sm">{num}</span>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="secondary" onClick={() => callContact(num)}>
                  <Phone className="h-4 w-4" /> Call
                </Button>
                <Button size="sm" variant="outline" onClick={() => smsContact(num)}>
                  <MessageSquare className="h-4 w-4" /> SMS
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};