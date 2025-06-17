
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, BookOpen, DollarSign, TrendingUp, Flag, Mail } from 'lucide-react';
import { AdminStats as AdminStatsType } from '@/services/admin/adminQueries';

interface AdminStatsProps {
  stats: AdminStatsType;
}

const AdminStats = ({ stats }: AdminStatsProps) => {
  const statsData = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toString(),
      icon: Users,
      description: 'Registered users'
    },
    {
      title: 'Active Listings',
      value: stats.activeListings.toString(),
      icon: BookOpen,
      description: 'Books for sale'
    },
    {
      title: 'Books Sold',
      value: stats.booksSold.toString(),
      icon: TrendingUp,
      description: 'Completed sales'
    },
    {
      title: 'Total Commission',
      value: `R${stats.monthlyCommission.toFixed(2)}`,
      icon: DollarSign,
      description: 'Commission earned'
    }
  ];

  const notificationStats = [
    {
      title: 'Pending Reports',
      value: stats.pendingReports,
      icon: Flag,
      color: 'bg-red-100 text-red-800',
      description: 'Reports awaiting review'
    },
    {
      title: 'Unread Messages',
      value: stats.unreadMessages,
      icon: Mail,
      color: 'bg-blue-100 text-blue-800',
      description: 'Contact form messages'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Notification Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        {notificationStats.map((stat, index) => (
          <Card key={index} className="border-l-4 border-l-orange-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <stat.icon className="h-4 w-4" />
                {stat.title}
              </CardTitle>
              {stat.value > 0 && (
                <Badge className={stat.color}>
                  {stat.value}
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminStats;
