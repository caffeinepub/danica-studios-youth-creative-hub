import { useState, useEffect } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useGetIncomeRecord } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Camera, ArrowLeft } from 'lucide-react';

export default function PhotoVideoDetailsPage() {
  const navigate = useNavigate();
  const { visitId } = useParams({ from: '/services/photo-video/$visitId' });
  const { data: visit, isLoading } = useGetIncomeRecord(BigInt(visitId));

  const [formData, setFormData] = useState({
    clientName: '',
    shootType: '',
    photographer: '',
    videographer: '',
    shootingHours: '',
    purpose: '',
  });

  useEffect(() => {
    if (visit?.photoVideoShoots) {
      setFormData({
        clientName: visit.photoVideoShoots.recordingArtistsOrPodcasts,
        shootType: visit.photoVideoShoots.shootType,
        photographer: visit.photoVideoShoots.primaryPhotographer,
        videographer: visit.photoVideoShoots.primaryVideographer,
        shootingHours: visit.photoVideoShoots.shootingHour.toString(),
        purpose: visit.photoVideoShoots.purposeOfShoot,
      });
    } else if (visit) {
      setFormData((prev) => ({ ...prev, clientName: visit.visitorName }));
    }
  }, [visit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.clientName.trim()) {
      toast.error('Please enter client name');
      return;
    }
    if (!formData.shootType.trim()) {
      toast.error('Please enter shoot type');
      return;
    }

    toast.success('Photo/Video session details saved!');
    navigate({ to: '/intake-complete' });
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
          <Camera className="h-8 w-8 text-[oklch(0.769_0.188_70.08)]" />
          Photo/Video Studio Session
        </h1>
        <p className="text-muted-foreground">Client: {visit.visitorName}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Shoot Details</CardTitle>
          <CardDescription>
            Enter the photo/video shoot information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name *</Label>
              <Input
                id="clientName"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                placeholder="Enter client name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shootType">Type of Shoot *</Label>
              <Input
                id="shootType"
                value={formData.shootType}
                onChange={(e) => setFormData({ ...formData, shootType: e.target.value })}
                placeholder="e.g., Portrait, Music Video, Product Photography"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="photographer">Primary Photographer</Label>
                <Input
                  id="photographer"
                  value={formData.photographer}
                  onChange={(e) => setFormData({ ...formData, photographer: e.target.value })}
                  placeholder="Photographer name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="videographer">Primary Videographer</Label>
                <Input
                  id="videographer"
                  value={formData.videographer}
                  onChange={(e) => setFormData({ ...formData, videographer: e.target.value })}
                  placeholder="Videographer name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shootingHours">Shooting Hours</Label>
              <Input
                id="shootingHours"
                type="number"
                min="0"
                value={formData.shootingHours}
                onChange={(e) => setFormData({ ...formData, shootingHours: e.target.value })}
                placeholder="Number of hours"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose of Shoot</Label>
              <Textarea
                id="purpose"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                placeholder="Additional notes about the shoot..."
                rows={4}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: '/' })}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Complete Registration
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
