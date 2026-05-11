import React, { useEffect, useState } from 'react';
import { 
  Typography, Paper, Box, CircularProgress, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, TextField, Grid, MenuItem, IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

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

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Currency unit state
  const [unit, setUnit] = useState<CurrencyUnit>('thousand');

  // Default to today's date in YYYY-MM-DD format
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

  useEffect(() => { fetchData(); }, []);

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedCategory = categories.find(cat => cat.name === newTransaction.category);
    
    // Apply multiplier based on unit
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
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Transactions</Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Quick Add</Typography>
        <form onSubmit={handleCreateTransaction}>
          <Grid container spacing={2}>
            {/* 1. Category */}
            <Grid item xs={12} sm={3}>
              <TextField 
                fullWidth 
                select 
                label="Category" 
                value={newTransaction.category} 
                onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
                required
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.name}>
                    {cat.name} ({cat.type})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* 2. Amount with Unit */}
            <Grid item xs={12} sm={3}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField 
                  fullWidth 
                  label="Amount" 
                  type="number" 
                  value={newTransaction.amount} 
                  onChange={(e) => setNewTransaction({...newTransaction, amount: Number(e.target.value)})} 
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

            {/* 3. Date */}
            <Grid item xs={12} sm={2}>
              <TextField 
                fullWidth 
                label="Date" 
                type="date" 
                value={newTransaction.transactionDate} 
                onChange={(e) => setNewTransaction({...newTransaction, transactionDate: e.target.value})} 
                required 
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* 4. Description */}
            <Grid item xs={12} sm={3}>
              <TextField 
                fullWidth 
                label="Description" 
                value={newTransaction.description} 
                onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})} 
                required 
              />
            </Grid>

            {/* Action Button */}
            <Grid item xs={12} sm={1}>
              <Button 
                fullWidth 
                variant="contained" 
                type="submit" 
                sx={{ height: '56px', borderRadius: 2 }}
              >
                Add
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Amount (VND)</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? <TableRow><TableCell colSpan={5} align="center"><CircularProgress /></TableCell></TableRow> :
             transactions.length === 0 ? <TableRow><TableCell colSpan={5} align="center">No records.</TableCell></TableRow> :
             transactions.map((row) => (
               <TableRow key={row.id} hover>
                 <TableCell>{new Date(row.transactionDate).toLocaleDateString()}</TableCell>
                 <TableCell>{row.description}</TableCell>
                 <TableCell>{row.category}</TableCell>
                 <TableCell align="right" sx={{ color: row.amount < 0 ? 'error.main' : 'success.main', fontWeight: 'bold' }}>
                   {row.amount > 0 ? '+' : ''}{row.amount.toLocaleString('vi-VN')}
                 </TableCell>
                 <TableCell align="center">
                   <IconButton onClick={() => row.id && handleDeleteTransaction(row.id)} color="error"><DeleteIcon /></IconButton>
                 </TableCell>
               </TableRow>
             ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Transactions;
