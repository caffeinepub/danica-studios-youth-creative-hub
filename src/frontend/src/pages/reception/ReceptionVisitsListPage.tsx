import { useGetAllIncomeRecords, useIsCallerAdmin, useDeleteAllIncomeRecords } from '../../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Mic, Camera, Radio, Plus, Eye, Trash2 } from 'lucide-react';
import { formatMonetaryAmount } from '../../utils/currency';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { useState } from 'react';

export default function ReceptionVisitsListPage() {
  const { data: visits, isLoading } = useGetAllIncomeRecords();
  const { data: isAdmin } = useIsCallerAdmin();
  const deleteAllMutation = useDeleteAllIncomeRecords();
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const getServiceIcon = (serviceType: string) => {
    switch (serviceType) {
      case 'Recording Studio':
        return <Mic className="h-4 w-4 text-[oklch(0.646_0.222_41.116)]" />;
      case 'Podcast Studio':
        return <Radio className="h-4 w-4 text-[oklch(0.6_0.118_184.704)]" />;
      case 'Photo/Video Studio':
        return <Camera className="h-4 w-4 text-[oklch(0.769_0.188_70.08)]" />;
      default:
        return null;
    }
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleClearHistory = async () => {
    try {
      await deleteAllMutation.mutateAsync();
      toast.success('Visit history cleared successfully');
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error('Error clearing visit history:', error);
      if (error.message?.includes('Unauthorized')) {
        toast.error('Unauthorized: Only admins can clear visit history');
      } else {
        toast.error('Failed to clear visit history. Please try again.');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">All Visits</h1>
          <p className="text-muted-foreground">
            {visits?.length || 0} total visits recorded
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && visits && visits.length > 0 && (
            <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  Clear History
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear All Visit History?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete all {visits.length} visit records from the system.
                    All income records, reports, and visit details will be removed.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleClearHistory}
                    disabled={deleteAllMutation.isPending}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleteAllMutation.isPending ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                        Clearing...
                      </>
                    ) : (
                      'Clear All History'
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button onClick={() => navigate({ to: '/' })} className="gap-2">
            <Plus className="h-4 w-4" />
            New Visit
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Visit History</CardTitle>
          <CardDescription>
            View all client visits and service bookings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!visits || visits.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No visits recorded yet</p>
              <Button onClick={() => navigate({ to: '/' })}>
                Register First Visit
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visits.map((visit, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {formatDate(visit.timestamp)}
                      </TableCell>
                      <TableCell>{visit.visitorName}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {visit.visitorPhoneNumber}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getServiceIcon(visit.serviceType)}
                          <span className="text-sm">{visit.serviceType}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatMonetaryAmount(visit.paymentAmount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={visit.payedInFull ? 'default' : 'secondary'}>
                          {visit.payedInFull ? 'Paid' : 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate({ to: `/visits/${index}` })}
                          className="gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
