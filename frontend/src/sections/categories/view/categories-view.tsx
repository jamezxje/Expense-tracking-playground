import React, { useState, useEffect } from 'react';

import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import CardContent from '@mui/material/CardContent';
import TableHead from '@mui/material/TableHead';
import CircularProgress from '@mui/material/CircularProgress';
import TableContainer from '@mui/material/TableContainer';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

interface Category {
  id: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
}

export function CategoriesView() {
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
    <DashboardContent>
      <Typography variant="h4" sx={{ mb: 5 }}>Quản lý danh mục</Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardHeader title="Thêm danh mục mới" titleTypographyProps={{ variant: 'h6' }} />
            <CardContent>
              <form onSubmit={handleCreateCategory}>
                <TextField 
                  fullWidth 
                  label="Tên danh mục" 
                  variant="outlined"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  sx={{ mb: 2 }}
                  required
                />
                <TextField
                  fullWidth
                  select
                  label="Loại"
                  value={newCategory.type}
                  onChange={(e) => setNewCategory({ ...newCategory, type: e.target.value as 'INCOME' | 'EXPENSE' })}
                  sx={{ mb: 3 }}
                >
                  <MenuItem value="INCOME">Thu nhập</MenuItem>
                  <MenuItem value="EXPENSE">Chi phí</MenuItem>
                </TextField>
                <Button 
                  fullWidth 
                  variant="contained" 
                  startIcon={<Iconify icon="mingcute:add-line" />}
                  type="submit"
                  sx={{ py: 1.5 }}
                >
                  Tạo danh mục
                </Button>
              </form>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Tên danh mục</TableCell>
                    <TableCell>Loại</TableCell>
                    <TableCell align="center">Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={3} align="center"><CircularProgress sx={{ my: 3 }} /></TableCell></TableRow>
                  ) : categories.length === 0 ? (
                    <TableRow><TableCell colSpan={3} align="center" sx={{ py: 3 }}>Không tìm thấy danh mục nào.</TableCell></TableRow>
                  ) : (
                    categories.map((cat) => (
                      <TableRow key={cat.id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{cat.name}</TableCell>
                        <TableCell>
                          <Chip 
                            label={cat.type === 'INCOME' ? 'THU NHẬP' : 'CHI PHÍ'} 
                            color={cat.type === 'INCOME' ? 'success' : 'error'} 
                            size="small" 
                            sx={{ fontWeight: 700, borderRadius: 1 }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton color="error" onClick={() => handleDeleteCategory(cat.id)}>
                            <Iconify icon="solar:trash-bin-trash-bold" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
