import React, { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { DashboardContent } from 'src/layouts/dashboard';

import { AnalyticsCurrentVisits } from '../analytics-current-visits';
import { AnalyticsWebsiteVisits } from '../analytics-website-visits';
import { AnalyticsWidgetSummary } from '../analytics-widget-summary';

// ----------------------------------------------------------------------

interface Summary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  categorySpending: Record<string, number>;
}

export function OverviewAnalyticsView() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports/summary?period=${period}`);
      const data = await res.json();
      setSummary(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const pieData = Object.entries(summary?.categorySpending || {}).map(([name, value]) => ({ label: name, value }));

  return (
    <DashboardContent maxWidth="xl">
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: { xs: 3, md: 5 } }}>
        <Typography variant="h4">
          Chào mừng trở lại! 👋
        </Typography>

        <TextField
          select
          size="small"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          sx={{ width: 150 }}
        >
          <MenuItem value="week">Tuần này</MenuItem>
          <MenuItem value="month">Tháng này</MenuItem>
          <MenuItem value="year">Năm này</MenuItem>
          <MenuItem value="all">Tất cả</MenuItem>
        </TextField>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <AnalyticsWidgetSummary
              title="Số dư hiện tại"
              total={summary?.balance || 0}
              percent={0}
              color={(summary?.balance || 0) < 0 ? 'error' : 'success'}
              icon={<img alt="Balance" src="/assets/icons/glass/ic-glass-bag.svg" />}
              chart={{
                categories: [],
                series: [],
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <AnalyticsWidgetSummary
              title="Tổng thu nhập"
              total={summary?.totalIncome || 0}
              percent={0}
              color="primary"
              icon={<img alt="Income" src="/assets/icons/glass/ic-glass-buy.svg" />}
              chart={{
                categories: [],
                series: [],
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <AnalyticsWidgetSummary
              title="Tổng chi tiêu"
              total={summary?.totalExpense || 0}
              percent={0}
              color="warning"
              icon={<img alt="Expense" src="/assets/icons/glass/ic-glass-message.svg" />}
              chart={{
                categories: [],
                series: [],
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <AnalyticsCurrentVisits
              title="Chi tiêu theo danh mục"
              chart={{
                series: pieData,
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6, lg: 8 }}>
            <AnalyticsWebsiteVisits
              title="Thu nhập vs Chi phí"
              chart={{
                categories: ['Thu nhập', 'Chi phí'],
                series: [
                  { name: 'Số tiền', data: [summary?.totalIncome || 0, summary?.totalExpense || 0] },
                ],
              }}
            />
          </Grid>
        </Grid>
      )}
    </DashboardContent>
  );
}
