import React, { useEffect, useState } from 'react';
import { Grid, Paper, Typography, Box, CircularProgress, Card, CardContent } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { TrendingUp, TrendingDown, AccountBalanceWallet } from '@mui/icons-material';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

interface Summary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  categorySpending: Record<string, number>;
}

const formatVND = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/reports/summary')
      .then(res => res.json())
      .then(data => {
        setSummary(data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;

  const pieData = Object.entries(summary?.categorySpending || {}).map(([name, value]) => ({ name, value }));

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>Tổng quan Dashboard</Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderLeft: '6px solid #4caf50', borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AccountBalanceWallet color="success" sx={{ mr: 1 }} />
                <Typography color="textSecondary" variant="subtitle2">Số dư hiện tại</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: (summary?.balance || 0) < 0 ? 'error.main' : 'success.main' }}>
                {formatVND(summary?.balance || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderLeft: '6px solid #2196f3', borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUp color="primary" sx={{ mr: 1 }} />
                <Typography color="textSecondary" variant="subtitle2">Tổng thu nhập</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{formatVND(summary?.totalIncome || 0)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderLeft: '6px solid #f44336', borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingDown color="error" sx={{ mr: 1 }} />
                <Typography color="textSecondary" variant="subtitle2">Tổng chi tiêu</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{formatVND(summary?.totalExpense || 0)}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 450, borderRadius: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>Chi tiêu theo danh mục</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${( (percent || 0) * 100).toFixed(0)}%`}
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => formatVND(Number(value))} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 450, borderRadius: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>Thu nhập vs Chi phí</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart
                data={[
                  { name: 'Thu nhập', amount: summary?.totalIncome },
                  { name: 'Chi phí', amount: summary?.totalExpense },
                ]}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `${(value / 1000).toLocaleString()}k`} />
                <Tooltip formatter={(value: any) => formatVND(Number(value))} />
                <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                   { [0, 1].map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#4caf50' : '#f44336'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
