import React, { useEffect, useState } from 'react';
import { 
  Typography, Paper, Box, CircularProgress, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, TextField, Grid, IconButton, Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

interface Category {
  id: string;
  name: string;
}

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState('');

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
    if (!newCategoryName) return;
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCategoryName })
    });
    if (res.ok) {
      setNewCategoryName('');
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
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                sx={{ mb: 2 }}
              />
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
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={2} align="center"><CircularProgress /></TableCell></TableRow>
                ) : categories.length === 0 ? (
                  <TableRow><TableCell colSpan={2} align="center">No categories found.</TableCell></TableRow>
                ) : (
                  categories.map((cat) => (
                    <TableRow key={cat.id} hover>
                      <TableCell>{cat.name}</TableCell>
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
