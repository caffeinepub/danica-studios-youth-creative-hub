import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useCreateIncomeRecord } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Mic, Camera, Radio, UserPlus } from 'lucide-react';
import { Currency } from '../../backend';
import { CURRENCIES, DEFAULT_CURRENCY } from '../../utils/currency';
import { prefillPhoneIfEmpty, getPhonePlaceholder } from '../../utils/phone';
import { storePodcastGuestTypePrefill } from '../../utils/urlParams';

export default function ReceptionVisitFormPage() {
  const navigate = useNavigate();
  const createRecord = useCreateIncomeRecord();

  const [formData, setFormData] = useState({
    visitorName: '',
    visitorPhoneNumber: '',
    serviceType: '',
    paymentAmount: '',
    paymentCurrency: DEFAULT_CURRENCY,
    payedInFull: false,
    podcastGuestType: '', // 'guest' or 'cohost' (maps to paying client)
    address: '',
    email: '',
    idNumber: '',
  });

  // Determine if payment UI should be hidden (Podcast Studio + Guest)
  const isPodcastGuest = formData.serviceType === 'Podcast Studio' && formData.podcastGuestType === 'guest';

  const handlePhoneFocus = () => {
    setFormData((prev) => ({
      ...prev,
      visitorPhoneNumber: prefillPhoneIfEmpty(prev.visitorPhoneNumber),
    }));
  };

  const handleServiceTypeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      serviceType: value,
      // Clear podcast guest type when switching away from Podcast Studio
      podcastGuestType: value === 'Podcast Studio' ? prev.podcastGuestType : '',
    }));
  };

  const handleGuestTypeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      podcastGuestType: value,
      // Reset payment to empty when switching to paying client to force re-entry
      // Set to '0' when switching to guest
      paymentAmount: value === 'guest' ? '0' : '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.visitorName.trim()) {
      toast.error('Please enter client name');
      return;
    }
    if (!formData.visitorPhoneNumber.trim()) {
      toast.error('Please enter phone number');
      return;
    }
    if (!formData.serviceType) {
      toast.error('Please select a service type');
      return;
    }
    if (formData.serviceType === 'Podcast Studio' && !formData.podcastGuestType) {
      toast.error('Please select whether this is a Guest or Paying Client');
      return;
    }

    // Skip payment validation for podcast guests
    if (!isPodcastGuest) {
      if (!formData.paymentAmount || Number(formData.paymentAmount) < 0) {
        toast.error('Please enter a valid payment amount');
        return;
      }
    }

    try {
      // Normalize payment to zero for podcast guests
      const paymentAmount = isPodcastGuest ? BigInt(0) : BigInt(Math.floor(Number(formData.paymentAmount) * 100));

      const visitId = await createRecord.mutateAsync({
        visitorName: formData.visitorName.trim(),
        visitorPhoneNumber: formData.visitorPhoneNumber.trim(),
        serviceType: formData.serviceType,
        paymentAmount: {
          amount: paymentAmount,
          currency: formData.paymentCurrency,
        },
        payedInFull: formData.payedInFull,
        address: formData.address.trim(),
        email: formData.email.trim(),
        idNumber: formData.idNumber.trim(),
      });

      toast.success('Visit registered successfully!');

      // Route to appropriate service detail form
      if (formData.serviceType === 'Recording Studio') {
        navigate({ to: `/services/recording/${visitId}` });
      } else if (formData.serviceType === 'Photo/Video Studio') {
        navigate({ to: `/services/photo-video/${visitId}` });
      } else if (formData.serviceType === 'Podcast Studio') {
        // Store the guest type selection for prefilling
        storePodcastGuestTypePrefill(visitId.toString(), formData.podcastGuestType);
        navigate({ to: `/services/podcast/${visitId}` });
      }
    } catch (error) {
      console.error('Failed to create visit:', error);
      toast.error('Failed to register visit. Please try again.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Reception - New Visit</h1>
        <p className="text-muted-foreground">Register a new client visit and select the service type</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Client Information
          </CardTitle>
          <CardDescription>
            Enter the client's details and payment information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="visitorName">Client Name *</Label>
              <Input
                id="visitorName"
                value={formData.visitorName}
                onChange={(e) => setFormData({ ...formData, visitorName: e.target.value })}
                placeholder="Enter client's full name"
                disabled={createRecord.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="visitorPhoneNumber">Phone Number *</Label>
              <Input
                id="visitorPhoneNumber"
                type="tel"
                value={formData.visitorPhoneNumber}
                onChange={(e) => setFormData({ ...formData, visitorPhoneNumber: e.target.value })}
                onFocus={handlePhoneFocus}
                placeholder={getPhonePlaceholder()}
                disabled={createRecord.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Home Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter home address"
                disabled={createRecord.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email address"
                disabled={createRecord.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="idNumber">Identification Number</Label>
              <Input
                id="idNumber"
                value={formData.idNumber}
                onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                placeholder="Enter identification number"
                disabled={createRecord.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="serviceType">Service Type *</Label>
              <Select
                value={formData.serviceType}
                onValueChange={handleServiceTypeChange}
                disabled={createRecord.isPending}
              >
                <SelectTrigger id="serviceType">
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Recording Studio">
                    <div className="flex items-center gap-2">
                      <Mic className="h-4 w-4 text-[oklch(0.646_0.222_41.116)]" />
                      Recording Studio
                    </div>
                  </SelectItem>
                  <SelectItem value="Podcast Studio">
                    <div className="flex items-center gap-2">
                      <Radio className="h-4 w-4 text-[oklch(0.6_0.118_184.704)]" />
                      Podcast Studio
                    </div>
                  </SelectItem>
                  <SelectItem value="Photo/Video Studio">
                    <div className="flex items-center gap-2">
                      <Camera className="h-4 w-4 text-[oklch(0.769_0.188_70.08)]" />
                      Photo/Video Studio
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.serviceType === 'Podcast Studio' && (
              <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
                <Label htmlFor="podcastGuestType">Guest Type *</Label>
                <RadioGroup
                  value={formData.podcastGuestType}
                  onValueChange={handleGuestTypeChange}
                  disabled={createRecord.isPending}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="guest" id="guest-type-guest" />
                    <Label htmlFor="guest-type-guest" className="font-normal cursor-pointer">
                      Guest
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cohost" id="guest-type-cohost" />
                    <Label htmlFor="guest-type-cohost" className="font-normal cursor-pointer">
                      Paying Client
                    </Label>
                  </div>
                </RadioGroup>
                <p className="text-sm text-muted-foreground">
                  Select whether this is a guest appearance or a paying client session
                </p>
              </div>
            )}

            {!isPodcastGuest && (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="paymentCurrency">Currency *</Label>
                    <Select
                      value={formData.paymentCurrency}
                      onValueChange={(value) => setFormData({ ...formData, paymentCurrency: value as Currency })}
                      disabled={createRecord.isPending}
                    >
                      <SelectTrigger id="paymentCurrency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map((currency) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            {currency.label} ({currency.symbol})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentAmount">Payment Amount *</Label>
                    <Input
                      id="paymentAmount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.paymentAmount}
                      onChange={(e) => setFormData({ ...formData, paymentAmount: e.target.value })}
                      placeholder="0.00"
                      disabled={createRecord.isPending}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="payedInFull">Paid in Full</Label>
                    <p className="text-sm text-muted-foreground">
                      Has the client paid the full amount?
                    </p>
                  </div>
                  <Switch
                    id="payedInFull"
                    checked={formData.payedInFull}
                    onCheckedChange={(checked) => setFormData({ ...formData, payedInFull: checked })}
                    disabled={createRecord.isPending}
                  />
                </div>
              </>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: '/visits' })}
                disabled={createRecord.isPending}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createRecord.isPending} className="flex-1">
                {createRecord.isPending ? 'Registering...' : 'Continue to Service Details'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
