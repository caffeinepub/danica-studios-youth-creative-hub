import { useState, useEffect } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useGetIncomeRecord, useUpdatePodcastDetails } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { Radio, ArrowLeft, Plus, X } from 'lucide-react';
import { prefillPhoneIfEmpty, getPhonePlaceholder } from '../../utils/phone';
import { getAndClearPodcastGuestTypePrefill } from '../../utils/urlParams';
import type { GuestType } from '../../backend';

interface GuestForm {
  id: string;
  name: string;
  phone: string;
  guestType: GuestType | '';
}

export default function PodcastDetailsPage() {
  const navigate = useNavigate();
  const { visitId } = useParams({ from: '/services/podcast/$visitId' });
  const { data: visit, isLoading } = useGetIncomeRecord(BigInt(visitId));
  const updatePodcastMutation = useUpdatePodcastDetails();

  const [formData, setFormData] = useState({
    podcastName: '',
    hostName: '',
  });

  const [guests, setGuests] = useState<GuestForm[]>([
    { id: crypto.randomUUID(), name: '', phone: '', guestType: '' },
  ]);

  useEffect(() => {
    if (visit?.podcast) {
      setFormData({
        podcastName: visit.podcast.podcastName,
        hostName: visit.podcast.hostName,
      });

      // Load guests from saved data or fallback to legacy single guest
      if (visit.podcast.guests && visit.podcast.guests.length > 0) {
        setGuests(
          visit.podcast.guests.map((g) => ({
            id: crypto.randomUUID(),
            name: g.name,
            phone: g.phoneNumber,
            guestType: g.guestType || 'guest',
          }))
        );
      }
    } else {
      // No saved podcast data - check for prefill from reception
      const prefillGuestType = getAndClearPodcastGuestTypePrefill(visitId);
      if (prefillGuestType) {
        // Prefill the first guest's type
        setGuests([
          { id: crypto.randomUUID(), name: '', phone: '', guestType: prefillGuestType as GuestType },
        ]);
      }
    }
  }, [visit, visitId]);

  const addGuest = () => {
    setGuests([...guests, { id: crypto.randomUUID(), name: '', phone: '', guestType: '' }]);
  };

  const removeGuest = (id: string) => {
    if (guests.length > 1) {
      setGuests(guests.filter((g) => g.id !== id));
    }
  };

  const updateGuest = (id: string, field: keyof GuestForm, value: string) => {
    setGuests(guests.map((g) => (g.id === id ? { ...g, [field]: value } : g)));
  };

  const handlePhoneFocus = (id: string) => {
    setGuests(
      guests.map((g) =>
        g.id === id ? { ...g, phone: prefillPhoneIfEmpty(g.phone) } : g
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.podcastName.trim()) {
      toast.error('Please enter podcast name');
      return;
    }
    if (!formData.hostName.trim()) {
      toast.error('Please enter host name');
      return;
    }

    // Filter guests with both name and phone
    const validGuests = guests.filter((g) => g.name.trim() && g.phone.trim());
    if (validGuests.length === 0) {
      toast.error('Please add at least one guest with name and phone number');
      return;
    }

    // Check that all valid guests have a guest type selected
    const missingGuestType = validGuests.some((g) => !g.guestType);
    if (missingGuestType) {
      toast.error('Please select a guest type for all guests');
      return;
    }

    try {
      await updatePodcastMutation.mutateAsync({
        recordId: BigInt(visitId),
        podcast: {
          podcastName: formData.podcastName,
          hostName: formData.hostName,
          guests: validGuests.map((g) => ({
            name: g.name,
            phoneNumber: g.phone,
            guestType: g.guestType as GuestType,
          })),
        },
      });

      toast.success('Podcast session details saved!');
      navigate({ to: '/intake-complete' });
    } catch (error) {
      console.error('Failed to save podcast details:', error);
      toast.error('Failed to save podcast details. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!visit) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Visit not found</p>
        <Button onClick={() => navigate({ to: '/' })} className="mt-4">
          Return to Reception
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Button
        variant="ghost"
        onClick={() => navigate({ to: '/' })}
        className="mb-6 gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Reception
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Radio className="h-8 w-8 text-[oklch(0.6_0.118_184.704)]" />
          Podcast Studio Session
        </h1>
        <p className="text-muted-foreground">Client: {visit.visitorName}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Podcast Details</CardTitle>
          <CardDescription>
            Enter the podcast information and guest details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="podcastName">Podcast Name *</Label>
              <Input
                id="podcastName"
                value={formData.podcastName}
                onChange={(e) => setFormData({ ...formData, podcastName: e.target.value })}
                placeholder="Enter podcast name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hostName">Host Name *</Label>
              <Input
                id="hostName"
                value={formData.hostName}
                onChange={(e) => setFormData({ ...formData, hostName: e.target.value })}
                placeholder="Enter host name"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Guests *</Label>
                <Button type="button" variant="outline" size="sm" onClick={addGuest} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Guest
                </Button>
              </div>

              {guests.map((guest, index) => (
                <Card key={guest.id} className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Guest {index + 1}</span>
                      {guests.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeGuest(guest.id)}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`guest-name-${guest.id}`}>Guest Name</Label>
                      <Input
                        id={`guest-name-${guest.id}`}
                        value={guest.name}
                        onChange={(e) => updateGuest(guest.id, 'name', e.target.value)}
                        placeholder="Enter guest name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`guest-phone-${guest.id}`}>Guest Phone Number</Label>
                      <Input
                        id={`guest-phone-${guest.id}`}
                        type="tel"
                        value={guest.phone}
                        onChange={(e) => updateGuest(guest.id, 'phone', e.target.value)}
                        onFocus={() => handlePhoneFocus(guest.id)}
                        placeholder={getPhonePlaceholder()}
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor={`guest-type-${guest.id}`}>Guest Type *</Label>
                      <RadioGroup
                        value={guest.guestType}
                        onValueChange={(value) => updateGuest(guest.id, 'guestType', value)}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="guest" id={`guest-type-guest-${guest.id}`} />
                          <Label htmlFor={`guest-type-guest-${guest.id}`} className="font-normal cursor-pointer">
                            Guest
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="cohost" id={`guest-type-cohost-${guest.id}`} />
                          <Label htmlFor={`guest-type-cohost-${guest.id}`} className="font-normal cursor-pointer">
                            Paying Client
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="assistant" id={`guest-type-assistant-${guest.id}`} />
                          <Label htmlFor={`guest-type-assistant-${guest.id}`} className="font-normal cursor-pointer">
                            Assistant
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: '/' })}
                disabled={updatePodcastMutation.isPending}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updatePodcastMutation.isPending} className="flex-1">
                {updatePodcastMutation.isPending ? 'Saving...' : 'Complete Intake'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
