'use client';

import { useStore } from '@/lib/store';
import { StatsCard } from '@/components/StatsCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Package,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle,
  BarChart3,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = [
  '#3b82f6', // blue
  '#22c55e', // green
  '#eab308', // yellow
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
  '#6b7280', // gray
];

export function DashboardSection() {
  const { getStats, inventory, transactions } = useStore();
  const stats = getStats();

  // Prepare category data for chart
  const categoryData = Object.entries(stats.categoryBreakdown)
    .filter(([, count]) => count > 0)
    .map(([category, count], index) => ({
      name: category,
      value: count,
      fill: COLORS[index % COLORS.length],
    }));

  // Prepare monthly data for chart
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return date.toLocaleString('default', { month: 'short' });
  }).reverse();

  const monthlyData = last6Months.map((month) => {
    const borrows = transactions.filter((t) => {
      const date = new Date(t.dateBorrowed);
      return date.toLocaleString('default', { month: 'short' }) === month;
    }).length;
    
    const returns = transactions.filter((t) => {
      if (!t.actualReturnDate) return false;
      const date = new Date(t.actualReturnDate);
      return date.toLocaleString('default', { month: 'short' }) === month;
    }).length;

    return { month, borrows, returns };
  });

  const chartConfig = {
    borrows: {
      label: "Borrows",
      color: "#3b82f6",
    },
    returns: {
      label: "Returns",
      color: "#22c55e",
    },
  } satisfies ChartConfig;

  const totalItemsCount = inventory.reduce((sum, item) => sum + item.quantityTotal, 0);
  const availablePercentage = totalItemsCount > 0 
    ? Math.round((stats.totalQuantity / totalItemsCount) * 100) 
    : 0;

  return (
    <section id="dashboard" className="py-16 bg-muted/30">
      <div className="container">
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Dashboard</h2>
          <p className="text-muted-foreground">
            Overview of lab inventory and activity statistics
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatsCard
            title="Total Items"
            value={stats.totalItems}
            description={`${stats.totalQuantity} units available`}
            icon={Package}
            variant="default"
          />
          <StatsCard
            title="Active Borrows"
            value={stats.activeBorrows}
            description="Currently borrowed"
            icon={TrendingUp}
            variant="success"
          />
          <StatsCard
            title="Overdue Items"
            value={stats.overdueItems}
            description="Past due date"
            icon={AlertTriangle}
            variant={stats.overdueItems > 0 ? 'danger' : 'default'}
          />
          <StatsCard
            title="Returned This Month"
            value={stats.returnedThisMonth}
            description="Items returned"
            icon={CheckCircle}
            variant="success"
          />
          <StatsCard
            title="Availability"
            value={`${availablePercentage}%`}
            description="Overall stock level"
            icon={BarChart3}
            variant={availablePercentage > 50 ? 'success' : availablePercentage > 20 ? 'warning' : 'danger'}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Monthly Activity Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Activity</CardTitle>
              <CardDescription>Borrows and returns over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-64 w-full">
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis 
                    dataKey="month" 
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <YAxis 
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="borrows" fill="var(--color-borrows)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="returns" fill="var(--color-returns)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Category Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Category Distribution</CardTitle>
              <CardDescription>Inventory breakdown by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {categoryData.slice(0, 6).map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.fill }}
                    />
                    <span className="text-sm text-muted-foreground truncate">{item.name}</span>
                    <span className="text-sm font-medium ml-auto">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stock Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Low Stock Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Low Stock Alert
              </CardTitle>
              <CardDescription>Items running low on stock</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {inventory
                  .filter((item) => item.status === 'Low Stock' || item.status === 'Out of Stock')
                  .slice(0, 5)
                  .map((item) => (
                    <div key={item.id} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium truncate mr-2">{item.name}</span>
                        <span className="text-muted-foreground">
                          {item.quantityAvailable}/{item.quantityTotal}
                        </span>
                      </div>
                      <Progress 
                        value={(item.quantityAvailable / item.quantityTotal) * 100} 
                        className="h-2"
                      />
                    </div>
                  ))}
                {inventory.filter((item) => item.status === 'Low Stock' || item.status === 'Out of Stock').length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    All items are well stocked
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Status Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Status Overview</CardTitle>
              <CardDescription>Current inventory status breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['Available', 'Low Stock', 'Out of Stock'].map((status) => {
                  const count = inventory.filter((item) => item.status === status).length;
                  const percentage = inventory.length > 0 ? (count / inventory.length) * 100 : 0;
                  const colors = {
                    'Available': 'bg-green-500',
                    'Low Stock': 'bg-yellow-500',
                    'Out of Stock': 'bg-red-500',
                  };
                  return (
                    <div key={status} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{status}</span>
                        <span className="font-medium">{count} items</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${colors[status as keyof typeof colors]} transition-all`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Statistics</CardTitle>
              <CardDescription>Key metrics at a glance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-muted-foreground">Total Categories</span>
                  <Badge variant="secondary">{Object.keys(stats.categoryBreakdown).filter(k => stats.categoryBreakdown[k as keyof typeof stats.categoryBreakdown] > 0).length}</Badge>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-muted-foreground">Total Transactions</span>
                  <Badge variant="secondary">{transactions.length}</Badge>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-muted-foreground">Return Rate</span>
                  <Badge variant="secondary">
                    {transactions.length > 0 
                      ? Math.round((transactions.filter(t => t.status === 'Returned').length / transactions.length) * 100)
                      : 0}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-muted-foreground">Avg Borrow Duration</span>
                  <Badge variant="secondary">
                    {transactions.filter(t => t.duration).length > 0
                      ? Math.round(transactions.filter(t => t.duration).reduce((sum, t) => sum + (t.duration || 0), 0) / transactions.filter(t => t.duration).length)
                      : 0} days
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest borrowing activity</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Borrower</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recentTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No recent transactions
                    </TableCell>
                  </TableRow>
                ) : (
                  stats.recentTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">{transaction.itemName}</TableCell>
                      <TableCell>
                        <div>
                          <p>{transaction.borrowerName}</p>
                          <p className="text-xs text-muted-foreground">{transaction.borrowerRollNo}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(transaction.dateBorrowed), 'dd MMM yyyy')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={transaction.status === 'Returned' ? 'default' : transaction.status === 'Overdue' ? 'destructive' : 'secondary'}>
                          {transaction.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
