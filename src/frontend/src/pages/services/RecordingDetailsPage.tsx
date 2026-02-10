import { useState, useEffect } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useGetIncomeRecord } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Mic, ArrowLeft } from 'lucide-react';

export default function RecordingDetailsPage() {
  const navigate = useNavigate();
  const { visitId } = useParams({ from: '/services/recording/$visitId' });
  const { data: visit, isLoading } = useGetIncomeRecord(BigInt(visitId));

  const [formData, setFormData] = useState({
    artistName: '',
    sessionType: '',
    sessionLength: '',
    purpose: '',
  });

  useEffect(() => {
    if (visit?.recordingSession) {
      setFormData({
        artistName: visit.recordingSession.recordingArtistsOrPodcasts,
        sessionType: visit.recordingSession.sessionType,
        sessionLength: visit.recordingSession.sessionLengthInMinutes.toString(),
        purpose: visit.recordingSession.purposeOfSession,
      });
    }
  }, [visit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.artistName.trim()) {
      toast.error('Please enter artist name');
      return;
    }
    if (!formData.sessionType.trim()) {
      toast.error('Please enter session type');
      return;
    }
    if (!formData.sessionLength || Number(formData.sessionLength) <= 0) {
      toast.error('Please enter a valid session duration (greater than 0 minutes)');
      return;
    }

    toast.success('Recording session details saved!');
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
          <Mic className="h-8 w-8 text-[oklch(0.646_0.222_41.116)]" />
          Recording Studio Session
        </h1>
        <p className="text-muted-foreground">Client: {visit.visitorName}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Session Details</CardTitle>
          <CardDescription>
            Enter the recording session information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="artistName">Artist Name *</Label>
              <Input
                id="artistName"
                value={formData.artistName}
                onChange={(e) => setFormData({ ...formData, artistName: e.target.value })}
                placeholder="Enter artist or band name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sessionType">Session Type *</Label>
              <Input
                id="sessionType"
                value={formData.sessionType}
                onChange={(e) => setFormData({ ...formData, sessionType: e.target.value })}
                placeholder="e.g., Album Recording, Single, Demo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sessionLength">Session Duration (minutes) *</Label>
              <Input
                id="sessionLength"
                type="number"
                min="1"
                value={formData.sessionLength}
                onChange={(e) => setFormData({ ...formData, sessionLength: e.target.value })}
                placeholder="60"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose of Session</Label>
              <Textarea
                id="purpose"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                placeholder="Additional notes about the session..."
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
