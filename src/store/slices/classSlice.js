import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import classService from '../../services/classes/classService';

export const fetchClasses = createAsyncThunk(
  'classes/fetchAll',
  async (branchId, {rejectWithValue}) => {
    try {
      return await classService.getClasses(branchId);
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to fetch classes');
    }
  },
);

export const createClass = createAsyncThunk(
  'classes/createClass',
  async (payload, {rejectWithValue}) => {
    try {
      return await classService.createClass(payload);
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to create class');
    }
  },
);

export const createSection = createAsyncThunk(
  'classes/createSection',
  async (payload, {rejectWithValue}) => {
    try {
      return await classService.createSection(payload);
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to create section');
    }
  },
);

const classSlice = createSlice({
  name: 'classes',
  initialState: {
    items: [],
    sections: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchClasses.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClasses.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchClasses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createClass.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(createSection.fulfilled, (state, action) => {
        state.sections.unshift(action.payload);
      });
  },
});

export default classSlice.reducer;
