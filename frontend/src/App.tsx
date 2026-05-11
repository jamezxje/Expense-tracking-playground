import { useEffect, useState } from 'react';
import { 
  Container, Typography, Paper, Box, CircularProgress, 
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
  transactionDate?: string;
}

interface Category {
  id: string;
  name: string;
}

function App() {
  const [status, setStatus] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog state
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Form state
  const [newTransaction, setNewTransaction] = useState<Transaction>({
    amount: 0,
    description: '',
    category: 'Other'
  });

  const fetchData = async () => {
    try {
      const [healthRes, transRes, catRes] = await Promise.all([
        fetch('/api/health'),
        fetch('/api/transactions'),
        fetch('/api/categories')
      ]);
      const healthData = await healthRes.json();
      const transData = await transRes.json();
      const catData = await catRes.json();
      
      setStatus(healthData.status);
      setTransactions(transData);
      setCategories(catData);
      
      if (catData.length > 0 && !newTransaction.category) {
        setNewTransaction(prev => ({ ...prev, category: catData[0].name }));
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTransaction)
      });
      if (res.ok) {
        setNewTransaction({ ...newTransaction, amount: 0, description: '' });
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName) return;
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName })
      });
      if (res.ok) {
        setNewCategoryName('');
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center" color="primary" sx={{ fontWeight: 'bold' }}>
          Personal Finance
        </Typography>

        <Paper sx={{ p: 1, mb: 3, textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2">Backend Status:</Typography>
          <Typography variant="body2" color={status === 'ok' ? 'success.main' : 'error.main'} sx={{ fontWeight: 'bold' }}>
            {status?.toUpperCase() || 'CONNECTING...'}
          </Typography>
        </Paper>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Transactions</Typography>
          <Button startIcon={<CategoryIcon />} variant="outlined" onClick={() => setOpenCategoryDialog(true)}>
            Manage Categories
          </Button>
        </Box>

        {/* Add Transaction Form */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <form onSubmit={handleCreateTransaction}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Amount"
                  type="number"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction({...newTransaction, amount: Number(e.target.value)})}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Description"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  select
                  label="Category"
                  value={newTransaction.category}
                  onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.name}>{cat.name}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={2}>
                <Button fullWidth variant="contained" color="primary" type="submit" sx={{ height: '56px' }}>
                  Add
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>

        {/* Transactions List */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell>Description</TableCell>
                <TableCell>Category</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center"><CircularProgress /></TableCell>
                </TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">No transactions found.</TableCell>
                </TableRow>
              ) : (
                transactions.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.description}</TableCell>
                    <TableCell>{row.category}</TableCell>
                    <TableCell align="right" sx={{ color: row.amount < 0 ? 'error.main' : 'success.main', fontWeight: 'bold' }}>
                      {row.amount.toLocaleString()}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton onClick={() => row.id && handleDeleteTransaction(row.id)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Category Management Dialog */}
        <Dialog open={openCategoryDialog} onClose={() => setOpenCategoryDialog(false)} fullWidth maxWidth="xs">
          <DialogTitle>Manage Categories</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', gap: 1, mt: 1, mb: 2 }}>
              <TextField 
                label="New Category" 
                fullWidth 
                size="small" 
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
              <Button variant="contained" onClick={handleCreateCategory}><AddIcon /></Button>
            </Box>
            <List sx={{ maxHeight: 300, overflow: 'auto' }}>
              {categories.map((cat) => (
                <ListItem key={cat.id} secondaryAction={
                  <IconButton edge="end" color="error" onClick={() => handleDeleteCategory(cat.id)}>
                    <DeleteIcon />
                  </IconButton>
                }>
                  <ListItemText primary={cat.name} />
                </ListItem>
              ))}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCategoryDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}

export default App;
