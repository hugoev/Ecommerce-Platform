import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { useUser } from "@/hooks/useUser";
import { useOrders } from "@/hooks/useOrders";
import { User, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import { useNavigate } from "react-router-dom";

export function ProfilePage() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const { profile, loading, error, fetchProfile, updateProfile, changePassword } = useUser();
  const { orders, fetchOrders } = useOrders();
  const { showToast } = useToast();
  
  // Get current user from auth state
  const user = useSelector((state: RootState) => state.auth.user);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const userId = user?.id;

  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    phone: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (isAuthenticated && userId) {
      fetchProfile(userId);
      fetchOrders(userId);
    } else if (!isAuthenticated) {
      // Redirect to login if not authenticated
      navigate('/login');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, isAuthenticated]);

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || '',
        address: profile.address || '',
        phone: profile.phone || '',
      });
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      await updateProfile(userId, formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (profile) {
      setFormData({
        fullName: profile.fullName || '',
        address: profile.address || '',
        phone: profile.phone || '',
      });
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword(userId, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      showToast('Password changed successfully', 'success');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Failed to change password:', error);
      showToast('Failed to change password. Please check your current password.', 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!isAuthenticated || !userId) {
    return (
      <div className="container py-8 px-4 max-w-4xl mx-auto">
        <div className="text-center py-12">
          <p className="text-text-muted mb-4">Please log in to view your profile.</p>
          <Button onClick={() => navigate('/login')}>Go to Login</Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container py-8 px-4 max-w-4xl mx-auto">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading profile...</span>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="container py-8 px-4 max-w-4xl mx-auto">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">Error: {error || 'Profile not found'}</p>
          <Button onClick={() => userId && fetchProfile(userId)}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 px-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">My Profile</h1>
        <p className="text-text-muted">Manage your account information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <p className="text-sm font-medium text-foreground py-2">{profile.username}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                {isEditing ? (
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  />
                ) : (
                  <p className="text-sm font-medium text-foreground py-2">{profile.fullName || 'Not set'}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                ) : (
                  <p className="text-sm font-medium text-foreground py-2">{profile.phone || 'Not set'}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                {isEditing ? (
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    rows={3}
                  />
                ) : (
                  <p className="text-sm font-medium text-foreground py-2">{profile.address || 'Not set'}</p>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                {isEditing ? (
                  <>
                    <Button onClick={handleSave}>Save Changes</Button>
                    <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Stats */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-text-muted">Orders Placed</span>
                <span className="font-semibold text-foreground">
                  {orders && Array.isArray(orders) ? orders.length : 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-text-muted">Total Spent</span>
                <span className="font-semibold text-foreground">
                  ${orders && Array.isArray(orders) 
                    ? orders.reduce((sum, order) => sum + (order.total || 0), 0).toFixed(2)
                    : '0.00'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-text-muted">Member Since</span>
                <span className="font-semibold text-foreground">
                  {profile.createdAt 
                    ? (() => {
                        try {
                          const date = new Date(profile.createdAt);
                          if (isNaN(date.getTime())) {
                            return 'N/A';
                          }
                          return date.toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short',
                            day: 'numeric'
                          });
                        } catch (e) {
                          return 'N/A';
                        }
                      })()
                    : 'N/A'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => window.location.href = '/orders'}
              >
                View Order History
              </Button>
              
              {/* Password Change Section */}
              <div className="space-y-3 pt-4 border-t">
                <h4 className="font-medium">Change Password</h4>
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="Current password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  />
                  <Input
                    type="password"
                    placeholder="New password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  />
                  <Input
                    type="password"
                    placeholder="Confirm new password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  />
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleChangePassword}
                    disabled={isChangingPassword}
                  >
                    {isChangingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : "Change Password"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
