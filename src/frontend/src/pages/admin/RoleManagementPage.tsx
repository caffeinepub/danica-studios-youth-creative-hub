import { useState } from 'react';
import { useAssignRole } from '../../hooks/useQueries';
import { UserRole } from '../../backend';
import { Principal } from '@dfinity/principal';
import RequireRole from '../../components/auth/RequireRole';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Shield, AlertCircle } from 'lucide-react';

function RoleManagementContent() {
  const [principalId, setPrincipalId] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');
  const assignRole = useAssignRole();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!principalId.trim()) {
      toast.error('Please enter a principal ID');
      return;
    }
    if (!selectedRole) {
      toast.error('Please select a role');
      return;
    }

    try {
      const principal = Principal.fromText(principalId.trim());
      await assignRole.mutateAsync({ user: principal, role: selectedRole });
      toast.success('Role assigned successfully!');
      setPrincipalId('');
      setSelectedRole('');
    } catch (error: any) {
      console.error('Failed to assign role:', error);
      if (error.message?.includes('Invalid principal')) {
        toast.error('Invalid principal ID format');
      } else {
        toast.error('Failed to assign role. Please try again.');
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Shield className="h-8 w-8" />
          Role Management
        </h1>
        <p className="text-muted-foreground">
          Assign roles to users for access control
        </p>
      </div>

      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Role Permissions:</strong>
          <ul className="mt-2 space-y-1 text-sm">
            <li><strong>Owner (Admin):</strong> Full access to all features including reports and role management</li>
            <li><strong>Management (User):</strong> Access to client data, visits, and financial reports</li>
            <li><strong>Admin (Guest):</strong> Operational access only, no financial reports</li>
          </ul>
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Assign User Role</CardTitle>
          <CardDescription>
            Enter the user's principal ID and select their role
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="principalId">Principal ID *</Label>
              <Input
                id="principalId"
                value={principalId}
                onChange={(e) => setPrincipalId(e.target.value)}
                placeholder="xxxxx-xxxxx-xxxxx-xxxxx-xxxxx-xxxxx-xxxxx-xxxxx-xxx"
                disabled={assignRole.isPending}
              />
              <p className="text-xs text-muted-foreground">
                The Internet Identity principal of the user
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select
                value={selectedRole}
                onValueChange={(value) => setSelectedRole(value as UserRole)}
                disabled={assignRole.isPending}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UserRole.admin}>
                    <div>
                      <div className="font-medium">Owner</div>
                      <div className="text-xs text-muted-foreground">Full access to all features</div>
                    </div>
                  </SelectItem>
                  <SelectItem value={UserRole.user}>
                    <div>
                      <div className="font-medium">Management</div>
                      <div className="text-xs text-muted-foreground">Access to operations and reports</div>
                    </div>
                  </SelectItem>
                  <SelectItem value={UserRole.guest}>
                    <div>
                      <div className="font-medium">Admin</div>
                      <div className="text-xs text-muted-foreground">Operational access only</div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" disabled={assignRole.isPending} className="w-full">
              {assignRole.isPending ? 'Assigning Role...' : 'Assign Role'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function RoleManagementPage() {
  return (
    <RequireRole allowedRoles={[UserRole.admin]}>
      <RoleManagementContent />
    </RequireRole>
  );
}
