import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import studentService from '../../services/students/studentService';

export const fetchStudentsForRole = createAsyncThunk(
  'students/fetchForRole',
  async (scope, {rejectWithValue}) => {
    try {
      return await studentService.getStudentsForRole(scope);
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to fetch students');
    }
  },
);

export const createStudent = createAsyncThunk(
  'students/create',
  async (payload, {rejectWithValue}) => {
    try {
      return await studentService.createStudent(payload.data || payload, payload.scope);
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to create student');
    }
  },
);

const studentSlice = createSlice({
  name: 'students',
  initialState: {
    items: [],
    loading: false,
    submitting: false,
    error: null,
    pageInfo: {
      limit: 50,
      offset: 0,
      hasMore: false,
    },
  },
  reducers: {
    clearStudentError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchStudentsForRole.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentsForRole.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchStudentsForRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createStudent.pending, state => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(createStudent.fulfilled, (state, action) => {
        state.submitting = false;
        state.items.unshift(action.payload);
      })
      .addCase(createStudent.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      });
  },
});

export const {clearStudentError} = studentSlice.actions;
export default studentSlice.reducer;
