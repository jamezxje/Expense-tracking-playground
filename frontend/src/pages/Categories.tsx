import React, { useEffect, useState } from 'react';
import { 
  Typography, Paper, Box, CircularProgress, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, TextField, Grid, IconButton, MenuItem, Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

interface Category {
  id: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
}

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState({ name: '', type: 'EXPENSE' });

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.name) return;
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCategory)
    });
    if (res.ok) {
      setNewCategory({ name: '', type: 'EXPENSE' });
      fetchCategories();
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    if (res.ok) fetchCategories();
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>Categories Management</Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Add New Category</Typography>
            <form onSubmit={handleCreateCategory}>
              <TextField 
                fullWidth 
                label="Category Name" 
                variant="outlined"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                sx={{ mb: 2 }}
                required
              />
              <TextField
                fullWidth
                select
                label="Type"
                value={newCategory.type}
                onChange={(e) => setNewCategory({ ...newCategory, type: e.target.value })}
                sx={{ mb: 2 }}
              >
                <MenuItem value="INCOME">Income</MenuItem>
                <MenuItem value="EXPENSE">Expense</MenuItem>
              </TextField>
              <Button 
                fullWidth 
                variant="contained" 
                startIcon={<AddIcon />}
                type="submit"
                sx={{ py: 1.5 }}
              >
                Create Category
              </Button>
            </form>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Table>
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Category Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={3} align="center"><CircularProgress /></TableCell></TableRow>
                ) : categories.length === 0 ? (
                  <TableRow><TableCell colSpan={3} align="center">No categories found.</TableCell></TableRow>
                ) : (
                  categories.map((cat) => (
                    <TableRow key={cat.id} hover>
                      <TableCell>{cat.name}</TableCell>
                      <TableCell>
                        <Chip 
                          label={cat.type} 
                          color={cat.type === 'INCOME' ? 'success' : 'error'} 
                          size="small" 
                          variant="outlined"
                          sx={{ fontWeight: 'bold' }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton color="error" onClick={() => handleDeleteCategory(cat.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Categories;
