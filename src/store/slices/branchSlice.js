import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import branchService from '../../services/branches/branchService';

export const fetchBranches = createAsyncThunk(
  'branches/fetchAll',
  async (_, {rejectWithValue}) => {
    try {
      return await branchService.getBranches();
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to fetch branches');
    }
  },
);

export const createBranch = createAsyncThunk(
  'branches/create',
  async (payload, {rejectWithValue}) => {
    try {
      return await branchService.createBranch(payload);
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to create branch');
    }
  },
);

const branchSlice = createSlice({
  name: 'branches',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchBranches.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBranches.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchBranches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createBranch.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBranch.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.items.unshift(action.payload);
      })
      .addCase(createBranch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default branchSlice.reducer;
