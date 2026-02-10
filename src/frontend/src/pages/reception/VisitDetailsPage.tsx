import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetAllIncomeRecords } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Mic, Camera, Radio, User, Phone, Calendar, DollarSign, Home, Mail, CreditCard } from 'lucide-react';
import { formatMonetaryAmount } from '../../utils/currency';
import type { GuestType } from '../../backend';

export default function VisitDetailsPage() {
  const { visitId } = useParams({ from: '/visits/$visitId' });
  const { data: visits, isLoading } = useGetAllIncomeRecords();
  const navigate = useNavigate();

  const visit = visits?.[Number(visitId)];

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getServiceIcon = (serviceType: string) => {
    switch (serviceType) {
      case 'Recording Studio':
        return <Mic className="h-6 w-6 text-[oklch(0.646_0.222_41.116)]" />;
      case 'Podcast Studio':
        return <Radio className="h-6 w-6 text-[oklch(0.6_0.118_184.704)]" />;
      case 'Photo/Video Studio':
        return <Camera className="h-6 w-6 text-[oklch(0.769_0.188_70.08)]" />;
      default:
        return null;
    }
  };

  const getGuestTypeLabel = (guestType: GuestType | undefined): string => {
    if (!guestType) return 'Guest';
    switch (guestType) {
      case 'guest':
        return 'Guest';
      case 'cohost':
        return 'Paying Client';
      case 'assistant':
        return 'Assistant';
      default:
        return 'Guest';
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
        <p className="text-muted-foreground mb-4">Visit not found</p>
        <Button onClick={() => navigate({ to: '/visits' })}>
          Back to All Visits
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Button
        variant="ghost"
        onClick={() => navigate({ to: '/visits' })}
        className="mb-6 gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to All Visits
      </Button>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {getServiceIcon(visit.serviceType)}
                <div>
                  <CardTitle className="text-2xl">{visit.serviceType}</CardTitle>
                  <CardDescription>Visit Details</CardDescription>
                </div>
              </div>
              <Badge variant={visit.payedInFull ? 'default' : 'secondary'} className="text-sm">
                {visit.payedInFull ? 'Paid in Full' : 'Payment Pending'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Client Name</p>
                  <p className="text-sm text-muted-foreground">{visit.visitorName}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Phone Number</p>
                  <p className="text-sm text-muted-foreground">{visit.visitorPhoneNumber}</p>
                </div>
              </div>
              {visit.address && visit.address !== '' && visit.address !== 'unknown' && (
                <div className="flex items-start gap-3">
                  <Home className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Home Address</p>
                    <p className="text-sm text-muted-foreground">{visit.address}</p>
                  </div>
                </div>
              )}
              {visit.email && visit.email !== '' && visit.email !== 'unknown' && (
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Email Address</p>
                    <p className="text-sm text-muted-foreground">{visit.email}</p>
                  </div>
                </div>
              )}
              {visit.idNumber && visit.idNumber !== '' && visit.idNumber !== 'unknown' && (
                <div className="flex items-start gap-3">
                  <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Identification Number</p>
                    <p className="text-sm text-muted-foreground">{visit.idNumber}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Visit Date</p>
                  <p className="text-sm text-muted-foreground">{formatDate(visit.timestamp)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Payment Amount</p>
                  <p className="text-sm text-muted-foreground">{formatMonetaryAmount(visit.paymentAmount)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {visit.recordingSession && (
          <Card>
            <CardHeader>
              <CardTitle>Recording Session Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-1">Artist Name</p>
                <p className="text-sm text-muted-foreground">{visit.recordingSession.recordingArtistsOrPodcasts}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium mb-1">Session Type</p>
                <p className="text-sm text-muted-foreground">{visit.recordingSession.sessionType}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium mb-1">Duration</p>
                <p className="text-sm text-muted-foreground">{Number(visit.recordingSession.sessionLengthInMinutes)} minutes</p>
              </div>
              {visit.recordingSession.purposeOfSession && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium mb-1">Purpose</p>
                    <p className="text-sm text-muted-foreground">{visit.recordingSession.purposeOfSession}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {visit.photoVideoShoots && (
          <Card>
            <CardHeader>
              <CardTitle>Photo/Video Shoot Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-1">Client Name</p>
                <p className="text-sm text-muted-foreground">{visit.photoVideoShoots.recordingArtistsOrPodcasts}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium mb-1">Shoot Type</p>
                <p className="text-sm text-muted-foreground">{visit.photoVideoShoots.shootType}</p>
              </div>
              <Separator />
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium mb-1">Photographer</p>
                  <p className="text-sm text-muted-foreground">{visit.photoVideoShoots.primaryPhotographer || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Videographer</p>
                  <p className="text-sm text-muted-foreground">{visit.photoVideoShoots.primaryVideographer || 'N/A'}</p>
                </div>
              </div>
              <Separator />
              {visit.photoVideoShoots.purposeOfShoot && (
                <>
                  <div>
                    <p className="text-sm font-medium mb-1">Purpose</p>
                    <p className="text-sm text-muted-foreground">{visit.photoVideoShoots.purposeOfShoot}</p>
                  </div>
                  <Separator />
                </>
              )}
              <div>
                <p className="text-sm font-medium mb-1">Duration</p>
                <p className="text-sm text-muted-foreground">{Number(visit.photoVideoShoots.sessionLengthInMinutes)} minutes</p>
              </div>
            </CardContent>
          </Card>
        )}

        {visit.podcast && (
          <Card>
            <CardHeader>
              <CardTitle>Podcast Session Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-1">Podcast Name</p>
                <p className="text-sm text-muted-foreground">{visit.podcast.podcastName}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium mb-1">Host Name</p>
                <p className="text-sm text-muted-foreground">{visit.podcast.hostName}</p>
              </div>
              {visit.podcast.guests && visit.podcast.guests.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium mb-2">Guests</p>
                    <div className="space-y-3">
                      {visit.podcast.guests.map((guest, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                          <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium">{guest.name}</p>
                              <Badge variant="outline" className="text-xs">
                                {getGuestTypeLabel(guest.guestType)}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{guest.phoneNumber}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
