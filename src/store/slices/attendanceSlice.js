import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import attendanceService from '../../services/attendance/attendanceService';

export const fetchAttendance = createAsyncThunk(
  'attendance/fetchAll',
  async (filters, {rejectWithValue}) => {
    try {
      return await attendanceService.getAttendance(filters);
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to fetch attendance');
    }
  },
);

export const markAttendance = createAsyncThunk(
  'attendance/mark',
  async (payload, {rejectWithValue}) => {
    try {
      return await attendanceService.markAttendance(payload);
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to mark attendance');
    }
  },
);

export const correctAttendance = createAsyncThunk(
  'attendance/correct',
  async (payload, {rejectWithValue}) => {
    try {
      return await attendanceService.correctAttendance(payload);
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to correct attendance');
    }
  },
);

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState: {
    items: [],
    loading: false,
    submitting: false,
    error: null,
  },
  reducers: {
    clearAttendanceError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchAttendance.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(markAttendance.pending, state => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(markAttendance.fulfilled, (state, action) => {
        state.submitting = false;
        state.items.unshift(action.payload);
      })
      .addCase(markAttendance.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      .addCase(correctAttendance.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          item => item.id === action.payload.id,
        );
        if (index >= 0) {
          state.items[index] = {...state.items[index], ...action.payload};
        }
      });
  },
});

export const {clearAttendanceError} = attendanceSlice.actions;
export default attendanceSlice.reducer;
