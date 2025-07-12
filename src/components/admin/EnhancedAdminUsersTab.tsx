import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Users,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  UserX,
  Shield,
  ShieldOff,
  Trash2,
  Download,
  Filter,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  Calendar,
  BookOpen,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import {
  getAllUsersForAdmin,
  getUserDetailsForAdmin,
  updateUserForAdmin,
  toggleUserStatus,
  toggleAdminStatus,
  deleteUserAccount,
  getUserStatsSummary,
  type AdminUserDetails,
  type AdminUserUpdate,
} from "@/services/admin/adminUserService";
import LoadingSpinner from "@/components/LoadingSpinner";

const EnhancedAdminUsersTab: React.FC = () => {
  const [users, setUsers] = useState<AdminUserDetails[]>([]);
  const [selectedUser, setSelectedUser] = useState<AdminUserDetails | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUserDetails | null>(null);
  const [stats, setStats] = useState({
    total_users: 0,
    active_users: 0,
    suspended_users: 0,
    admin_users: 0,
    new_users_this_week: 0,
    new_users_this_month: 0,
  });

  const loadUsers = async () => {
    try {
      setLoading(true);
      const [usersData, statsData] = await Promise.all([
        getAllUsersForAdmin(100, 0, searchTerm, statusFilter),
        getUserStatsSummary(),
      ]);
      setUsers(usersData);
      setStats(statsData);
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [searchTerm, statusFilter]);

  const handleViewUser = async (userId: string) => {
    try {
      const user = await getUserDetailsForAdmin(userId);
      if (user) {
        setSelectedUser(user);
        setShowUserDialog(true);
      }
    } catch (error) {
      toast.error("Failed to load user details");
    }
  };

  const handleEditUser = (user: AdminUserDetails) => {
    setEditingUser(user);
    setShowEditDialog(true);
  };

  const handleSaveUser = async (updates: AdminUserUpdate) => {
    if (!editingUser) return;

    try {
      await updateUserForAdmin(editingUser.id, updates);
      setShowEditDialog(false);
      setEditingUser(null);
      await loadUsers();
    } catch (error) {
      // Error already handled in service
    }
  };

  const handleToggleStatus = async (userId: string, suspend: boolean) => {
    try {
      await toggleUserStatus(userId, suspend);
      await loadUsers();
    } catch (error) {
      // Error already handled in service
    }
  };

  const handleToggleAdmin = async (userId: string, makeAdmin: boolean) => {
    try {
      await toggleAdminStatus(userId, makeAdmin);
      await loadUsers();
    } catch (error) {
      // Error already handled in service
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const reason = prompt(
      "Please provide a reason for deleting this user account:",
    );
    if (!reason) return;

    if (
      confirm(
        "Are you sure you want to delete this user account? This action cannot be undone.",
      )
    ) {
      try {
        await deleteUserAccount(userId, reason);
        await loadUsers();
      } catch (error) {
        // Error already handled in service
      }
    }
  };

  const exportUsers = () => {
    const csvContent = [
      [
        "Name",
        "Email",
        "Status",
        "Admin",
        "Total Listings",
        "Sold Books",
        "Sales Value",
        "Created At",
      ].join(","),
      ...users.map((user) =>
        [
          user.name,
          user.email,
          user.status,
          user.is_admin ? "Yes" : "No",
          user.total_listings,
          user.sold_books,
          (user.total_sales_value / 100).toFixed(2),
          new Date(user.created_at).toLocaleDateString(),
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users-export-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "default",
      inactive: "secondary",
      suspended: "destructive",
      deleted: "outline",
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatCurrency = (amountInCents: number) => {
    return `R${(amountInCents / 100).toFixed(2)}`;
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading users..." />;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total Users</p>
                <p className="text-2xl font-bold">{stats.total_users}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Active</p>
                <p className="text-2xl font-bold">{stats.active_users}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserX className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-sm font-medium">Suspended</p>
                <p className="text-2xl font-bold">{stats.suspended_users}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Admins</p>
                <p className="text-2xl font-bold">{stats.admin_users}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">This Week</p>
                <p className="text-2xl font-bold">
                  {stats.new_users_this_week}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">This Month</p>
                <p className="text-2xl font-bold">
                  {stats.new_users_this_month}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>User Management</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button onClick={loadUsers} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={exportUsers} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mb-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Users</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status-filter">Filter by Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status-filter" className="w-40">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Users Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Listings</TableHead>
                  <TableHead>Sales</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="text-gray-500">
                        <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>No users found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                          {user.is_admin && (
                            <Badge variant="secondary" className="mt-1">
                              <Shield className="h-3 w-3 mr-1" />
                              Admin
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{user.total_listings} total</div>
                          <div className="text-gray-500">
                            {user.active_listings} active
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{user.sold_books} sold</div>
                          <div className="text-gray-500">
                            {user.total_purchases} purchased
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatCurrency(user.total_sales_value)}
                      </TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => handleViewUser(user.id)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEditUser(user)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() =>
                                handleToggleStatus(
                                  user.id,
                                  user.status === "active",
                                )
                              }
                            >
                              <UserX className="h-4 w-4 mr-2" />
                              {user.status === "active"
                                ? "Suspend"
                                : "Unsuspend"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleToggleAdmin(user.id, !user.is_admin)
                              }
                            >
                              {user.is_admin ? (
                                <ShieldOff className="h-4 w-4 mr-2" />
                              ) : (
                                <Shield className="h-4 w-4 mr-2" />
                              )}
                              {user.is_admin ? "Remove Admin" : "Make Admin"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Comprehensive information about the user account
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Basic Information</Label>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span>{selectedUser.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{selectedUser.email}</span>
                    </div>
                    {selectedUser.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{selectedUser.phone}</span>
                      </div>
                    )}
                    {selectedUser.university && (
                      <div className="flex items-center space-x-2">
                        <BookOpen className="h-4 w-4 text-gray-400" />
                        <span>{selectedUser.university}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <Label>Account Status</Label>
                  <div className="space-y-2 mt-2">
                    <div>Status: {getStatusBadge(selectedUser.status)}</div>
                    <div>Admin: {selectedUser.is_admin ? "Yes" : "No"}</div>
                    <div>
                      Banking:{" "}
                      {selectedUser.has_banking_setup
                        ? selectedUser.banking_verified
                          ? "Verified"
                          : "Setup"
                        : "Not setup"}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label>Statistics</Label>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-2xl font-bold">
                      {selectedUser.total_listings}
                    </div>
                    <div className="text-sm text-gray-500">Total Listings</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-2xl font-bold">
                      {selectedUser.sold_books}
                    </div>
                    <div className="text-sm text-gray-500">Books Sold</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-2xl font-bold">
                      {formatCurrency(selectedUser.total_sales_value)}
                    </div>
                    <div className="text-sm text-gray-500">Sales Revenue</div>
                  </div>
                </div>
              </div>

              {selectedUser.address_line1 && (
                <div>
                  <Label>Address</Label>
                  <div className="mt-2 flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>
                      {selectedUser.address_line1}, {selectedUser.city},{" "}
                      {selectedUser.province}, {selectedUser.country}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <Label>Account Dates</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <span className="text-sm text-gray-500">Created:</span>
                    <div>
                      {new Date(selectedUser.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Updated:</span>
                    <div>
                      {new Date(selectedUser.updated_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowUserDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user account information
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <UserEditForm
              user={editingUser}
              onSave={handleSaveUser}
              onCancel={() => setShowEditDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// User Edit Form Component
const UserEditForm: React.FC<{
  user: AdminUserDetails;
  onSave: (updates: AdminUserUpdate) => void;
  onCancel: () => void;
}> = ({ user, onSave, onCancel }) => {
  const [formData, setFormData] = useState<AdminUserUpdate>({
    name: user.name,
    status: user.status as "active" | "inactive" | "suspended",
    is_admin: user.is_admin,
    phone: user.phone || "",
    university: user.university || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="edit-name">Name</Label>
        <Input
          id="edit-name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="edit-phone">Phone</Label>
        <Input
          id="edit-phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="edit-university">University</Label>
        <Input
          id="edit-university"
          value={formData.university}
          onChange={(e) =>
            setFormData({ ...formData, university: e.target.value })
          }
        />
      </div>

      <div>
        <Label htmlFor="edit-status">Status</Label>
        <Select
          value={formData.status}
          onValueChange={(value) =>
            setFormData({ ...formData, status: value as any })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="edit-admin"
          checked={formData.is_admin}
          onChange={(e) =>
            setFormData({ ...formData, is_admin: e.target.checked })
          }
        />
        <Label htmlFor="edit-admin">Administrator privileges</Label>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Changes</Button>
      </DialogFooter>
    </form>
  );
};

export default EnhancedAdminUsersTab;
