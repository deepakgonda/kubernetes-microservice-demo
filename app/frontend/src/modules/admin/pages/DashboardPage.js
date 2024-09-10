import React, { useState, useEffect, useContext } from 'react';
import { Container, Typography, List, ListItem, ListItemText, IconButton, CircularProgress, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Fab, Box } from '@mui/material';
import { AuthContext } from '../../../AuthContext';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const DashboardPage = () => {
  const [todos, setTodos] = useState([]);
  const [newTodoTitle, setNewTodoTitle] = useState('');  // Title for new todo
  const [newTodoText, setNewTodoText] = useState('');    // Text for new todo
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);  // For opening the dialog
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const { axiosInstance } = useContext(AuthContext);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`${process.env.REACT_APP_TASKS_SERVICE_API_URL}/tasks`);
      setTodos(response.data?.tasks);
    } catch (err) {
      setSnackbarMessage('Error loading Todos');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTodo = async () => {
    if (!newTodoTitle.trim() || !newTodoText.trim()) {
      setSnackbarMessage('Title and Text are required');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    
    setLoading(true);
    try {
      const response = await axiosInstance.post(`${process.env.REACT_APP_TASKS_SERVICE_API_URL}/tasks`, {
        title: newTodoTitle,
        text: newTodoText
      });
      setTodos([...todos, response.data?.task]);
      setNewTodoTitle('');  // Clear the title field
      setNewTodoText('');   // Clear the text field
      setSnackbarMessage('Todo added successfully');
      setSnackbarSeverity('success');
      setDialogOpen(false); // Close the dialog after adding the todo
    } catch (err) {
      setSnackbarMessage('Failed to add todo');
      setSnackbarSeverity('error');
    } finally {
      setLoading(false);
      setSnackbarOpen(true);
    }
  };

  const handleDeleteTodo = async (id) => {
    setLoading(true);
    try {
      await axiosInstance.delete(`${process.env.REACT_APP_TASKS_SERVICE_API_URL}/tasks/${id}`);
      setTodos(todos.filter(todo => todo._id !== id));
      setSnackbarMessage('Todo deleted successfully');
      setSnackbarSeverity('success');
    } catch (err) {
      setSnackbarMessage('Failed to delete todo');
      setSnackbarSeverity('error');
    } finally {
      setLoading(false);
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Your Todos:</Typography>
      <Typography>You can see and manage your Todo list here:</Typography>

      <Box mt={3}>
        {loading && <CircularProgress />}
        {!loading && todos.length === 0 && <Typography>No todos found</Typography>}

        <List>
          {todos.map((todo) => (
            <ListItem key={todo._id} secondaryAction={
              <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteTodo(todo._id)}>
                <DeleteIcon />
              </IconButton>
            }>
              <ListItemText primary={todo.title} secondary={todo.text} />
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Floating Add Todo Button */}
      <Fab color="primary" aria-label="add" onClick={handleDialogOpen} style={{ position: 'fixed', bottom: '20px', right: '20px' }}>
        <AddIcon />
      </Fab>

      {/* Add Todo Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Add New Todo</DialogTitle>
        <DialogContent>
          <TextField
            label="Todo Title"
            fullWidth
            value={newTodoTitle}
            onChange={(e) => setNewTodoTitle(e.target.value)}
            margin="normal"
          />
          <TextField
            label="Todo Text"
            fullWidth
            multiline
            rows={4}
            value={newTodoText}
            onChange={(e) => setNewTodoText(e.target.value)}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="secondary">Cancel</Button>
          <Button onClick={handleAddTodo} color="primary" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Add Todo'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for displaying messages */}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

    </Container>
  );
};

export default DashboardPage;
