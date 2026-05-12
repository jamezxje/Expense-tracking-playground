import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import TableContainer from '@mui/material/TableContainer';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

interface Transaction {
  id?: string;
  amount: number;
  description: string;
  category: string;
  transactionDate: string;
}

interface Category {
  id: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
}

type CurrencyUnit = 'thousand' | 'million';

export function TransactionsView() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [unit, setUnit] = useState<CurrencyUnit>('thousand');
  const today = new Date().toISOString().split('T')[0];

  const [newTransaction, setNewTransaction] = useState<Transaction>({ 
    amount: 0, 
    description: '', 
    category: '', 
    transactionDate: today 
  });

  const fetchData = async () => {
    try {
      const [transRes, catRes] = await Promise.all([
        fetch('/api/transactions'),
        fetch('/api/categories')
      ]);
      const transData = await transRes.json();
      const catData = await catRes.json();
      
      const sortedTrans = transData.sort((a: any, b: any) => 
        new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime()
      );

      setTransactions(sortedTrans);
      setCategories(catData);
      
      if (catData.length > 0 && !newTransaction.category) {
        setNewTransaction(prev => ({ ...prev, category: catData[0].name }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchData(); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedCategory = categories.find(cat => cat.name === newTransaction.category);
    const multiplier = unit === 'thousand' ? 1000 : 1000000;
    let finalAmount = Math.abs(newTransaction.amount) * multiplier;
    
    if (selectedCategory?.type === 'EXPENSE') {
      finalAmount = -finalAmount;
    }

    const transactionToSave = {
      ...newTransaction,
      amount: finalAmount,
      transactionDate: newTransaction.transactionDate + "T00:00:00"
    };

    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transactionToSave)
    });
    if (res.ok) {
      setNewTransaction({ ...newTransaction, amount: 0, description: '', transactionDate: today });
      fetchData();
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
    if (res.ok) fetchData();
  };

  return (
    <DashboardContent>
      <Typography variant="h4" sx={{ mb: 5 }}>Quản lý giao dịch</Typography>

      <Card sx={{ mb: 5 }}>
        <CardHeader title="Thêm nhanh" titleTypographyProps={{ variant: 'h6' }} />
        <CardContent>
          <form onSubmit={handleCreateTransaction}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 3 }}>
                <TextField 
                  fullWidth 
                  select 
                  label="Danh mục" 
                  value={newTransaction.category} 
                  onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
                  required
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.name}>
                      {cat.name} ({cat.type === 'INCOME' ? 'THU NHẬP' : 'CHI PHÍ'})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 3 }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField 
                    fullWidth 
                    label="Số tiền" 
                    type="number" 
                    value={newTransaction.amount === 0 ? '' : newTransaction.amount} 
                    onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value === '' ? 0 : Number(e.target.value)})} 
                    required 
                  />
                  <TextField
                    select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as CurrencyUnit)}
                    sx={{ width: '130px' }}
                  >
                    <MenuItem value="thousand">.000</MenuItem>
                    <MenuItem value="million">.000.000</MenuItem>
                  </TextField>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, sm: 2 }}>
                <TextField 
                  fullWidth 
                  label="Ngày" 
                  type="date" 
                  value={newTransaction.transactionDate} 
                  onChange={(e) => setNewTransaction({...newTransaction, transactionDate: e.target.value})} 
                  required 
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 3 }}>
                <TextField 
                  fullWidth 
                  label="Mô tả" 
                  value={newTransaction.description} 
                  onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})} 
                  required 
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 1 }}>
                <Button 
                  fullWidth 
                  variant="contained" 
                  type="submit" 
                  sx={{ height: '56px' }}
                >
                  Thêm
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Ngày</TableCell>
                <TableCell>Mô tả</TableCell>
                <TableCell>Danh mục</TableCell>
                <TableCell align="right">Số tiền (VND)</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? <TableRow><TableCell colSpan={5} align="center"><CircularProgress sx={{ my: 3 }} /></TableCell></TableRow> :
               transactions.length === 0 ? <TableRow><TableCell colSpan={5} align="center" sx={{ py: 3 }}>Không có dữ liệu.</TableCell></TableRow> :
               transactions.map((row) => (
                 <TableRow key={row.id} hover>
                   <TableCell>{new Date(row.transactionDate).toLocaleDateString()}</TableCell>
                   <TableCell>{row.description}</TableCell>
                   <TableCell>{row.category}</TableCell>
                   <TableCell align="right" sx={{ color: row.amount < 0 ? 'error.main' : 'success.main', fontWeight: 700 }}>
                     {row.amount > 0 ? '+' : ''}{row.amount.toLocaleString('vi-VN')}
                   </TableCell>
                   <TableCell align="center">
                     <IconButton onClick={() => row.id && handleDeleteTransaction(row.id)} color="error">
                        <Iconify icon="solar:trash-bin-trash-bold" />
                     </IconButton>
                   </TableCell>
                 </TableRow>
               ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </DashboardContent>
  );
}
