import React, { useEffect, useState } from 'react';
import { 
  Typography, Paper, Box, CircularProgress, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, TextField, Grid, MenuItem, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CategoryIcon from '@mui/icons-material/Category';

interface Transaction {
  id?: string;
  amount: number;
  description: string;
  category: string;
}

interface Category {
  id: string;
  name: string;
}

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newTransaction, setNewTransaction] = useState<Transaction>({ amount: 0, description: '', category: '' });

  const fetchData = async () => {
    try {
      const [transRes, catRes] = await Promise.all([
        fetch('/api/transactions'),
        fetch('/api/categories')
      ]);
      const transData = await transRes.json();
      const catData = await catRes.json();
      setTransactions(transData);
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
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTransaction)
    });
    if (res.ok) {
      setNewTransaction({ ...newTransaction, amount: 0, description: '' });
      fetchData();
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
    if (res.ok) fetchData();
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName) return;
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCategoryName })
    });
    if (res.ok) {
      setNewCategoryName('');
      fetchData();
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    if (res.ok) fetchData();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Transactions</Typography>
        <Button startIcon={<CategoryIcon />} variant="outlined" onClick={() => setOpenCategoryDialog(true)}>
          Categories
        </Button>
      </Box>

      <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Quick Add</Typography>
        <form onSubmit={handleCreateTransaction}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <TextField fullWidth label="Amount" type="number" value={newTransaction.amount} onChange={(e) => setNewTransaction({...newTransaction, amount: Number(e.target.value)})} required />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Description" value={newTransaction.description} onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})} required />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField fullWidth select label="Category" value={newTransaction.category} onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}>
                {categories.map((cat) => <MenuItem key={cat.id} value={cat.name}>{cat.name}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button fullWidth variant="contained" type="submit" sx={{ height: '56px', borderRadius: 2 }}>Add</Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Amount</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? <TableRow><TableCell colSpan={4} align="center"><CircularProgress /></TableCell></TableRow> :
             transactions.length === 0 ? <TableRow><TableCell colSpan={4} align="center">No records.</TableCell></TableRow> :
             transactions.map((row) => (
               <TableRow key={row.id} hover>
                 <TableCell>{row.description}</TableCell>
                 <TableCell>{row.category}</TableCell>
                 <TableCell align="right" sx={{ color: row.amount < 0 ? 'error.main' : 'success.main', fontWeight: 'bold' }}>
                   {row.amount > 0 ? '+' : ''}{row.amount.toLocaleString()}
                 </TableCell>
                 <TableCell align="center">
                   <IconButton onClick={() => row.id && handleDeleteTransaction(row.id)} color="error"><DeleteIcon /></IconButton>
                 </TableCell>
               </TableRow>
             ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openCategoryDialog} onClose={() => setOpenCategoryDialog(false)} fullWidth maxWidth="xs">
        <DialogTitle>Categories</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', gap: 1, mt: 1, mb: 2 }}>
            <TextField label="New" fullWidth size="small" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} />
            <Button variant="contained" onClick={handleCreateCategory}><AddIcon /></Button>
          </Box>
          <List sx={{ maxHeight: 300, overflow: 'auto' }}>
            {categories.map((cat) => (
              <ListItem key={cat.id} secondaryAction={<IconButton edge="end" color="error" onClick={() => handleDeleteCategory(cat.id)}><DeleteIcon /></IconButton>}>
                <ListItemText primary={cat.name} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Transactions;
