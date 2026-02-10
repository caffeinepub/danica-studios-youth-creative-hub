import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Home, Users } from 'lucide-react';

export default function IntakeCompletePage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-2 border-[oklch(0.646_0.222_41.116)]">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-[oklch(0.646_0.222_41.116)]/10 p-6">
              <CheckCircle2 className="h-16 w-16 text-[oklch(0.646_0.222_41.116)]" />
            </div>
          </div>
          <CardTitle className="text-3xl">Registration Complete!</CardTitle>
          <CardDescription className="text-base">
            The client visit and service details have been successfully recorded.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              onClick={() => navigate({ to: '/' })}
              className="gap-2"
              size="lg"
            >
              <Home className="h-4 w-4" />
              New Visit
            </Button>
            <Button
              onClick={() => navigate({ to: '/visits' })}
              variant="outline"
              className="gap-2"
              size="lg"
            >
              <Users className="h-4 w-4" />
              View All Visits
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
