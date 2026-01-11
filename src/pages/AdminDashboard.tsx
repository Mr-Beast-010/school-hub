import { useState } from 'react';
import { Shield, Users, UserCheck, Search, ChevronDown } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Navigate } from 'react-router-dom';

type AppRole = 'admin' | 'teacher' | 'student';

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  role: AppRole;
  created_at: string;
}

const AdminDashboard = () => {
  const { isAdmin, loading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all profiles (admin only)
  const { data: profiles, isLoading: profilesLoading } = useQuery({
    queryKey: ['admin-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as UserProfile[];
    },
    enabled: isAdmin,
  });

  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: AppRole }) => {
      // Update profile role
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (profileError) throw profileError;

      // Update user_roles table
      const { error: roleError } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (roleError) throw roleError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-profiles'] });
      toast({
        title: 'Role Updated',
        description: 'User role has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const filteredProfiles = profiles?.filter(
    (p) =>
      p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeVariant = (role: AppRole) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'teacher':
        return 'default';
      case 'student':
        return 'secondary';
    }
  };

  const stats = {
    total: profiles?.length || 0,
    admins: profiles?.filter((p) => p.role === 'admin').length || 0,
    teachers: profiles?.filter((p) => p.role === 'teacher').length || 0,
    students: profiles?.filter((p) => p.role === 'student').length || 0,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-display font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage user roles and permissions</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
          <div className="form-card flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Users</p>
            </div>
          </div>
          <div className="form-card flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.admins}</p>
              <p className="text-sm text-muted-foreground">Admins</p>
            </div>
          </div>
          <div className="form-card flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.teachers}</p>
              <p className="text-sm text-muted-foreground">Teachers</p>
            </div>
          </div>
          <div className="form-card flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.students}</p>
              <p className="text-sm text-muted-foreground">Students</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="form-card animate-fade-in">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="table-container animate-fade-in">
          {profilesLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold">User</th>
                    <th className="text-left py-4 px-6 font-semibold">Email</th>
                    <th className="text-left py-4 px-6 font-semibold">Current Role</th>
                    <th className="text-right py-4 px-6 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredProfiles?.map((profile) => (
                    <tr key={profile.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold">
                            {profile.full_name?.charAt(0) || profile.email.charAt(0).toUpperCase()}
                          </div>
                          <p className="font-medium text-foreground">
                            {profile.full_name || 'No name'}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-muted-foreground">{profile.email}</td>
                      <td className="py-4 px-6">
                        <Badge variant={getRoleBadgeVariant(profile.role)}>
                          {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                Change Role
                                <ChevronDown className="w-4 h-4 ml-2" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  updateRoleMutation.mutate({
                                    userId: profile.user_id,
                                    newRole: 'admin',
                                  })
                                }
                                disabled={profile.role === 'admin'}
                              >
                                <Shield className="w-4 h-4 mr-2" />
                                Promote to Admin
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  updateRoleMutation.mutate({
                                    userId: profile.user_id,
                                    newRole: 'teacher',
                                  })
                                }
                                disabled={profile.role === 'teacher'}
                              >
                                <UserCheck className="w-4 h-4 mr-2" />
                                Set as Teacher
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  updateRoleMutation.mutate({
                                    userId: profile.user_id,
                                    newRole: 'student',
                                  })
                                }
                                disabled={profile.role === 'student'}
                              >
                                <Users className="w-4 h-4 mr-2" />
                                Set as Student
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {filteredProfiles?.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">No users found.</div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;