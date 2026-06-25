import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import feeService from '../../services/fees/feeService';

export const fetchFees = createAsyncThunk(
  'fees/fetchAll',
  async (access, {rejectWithValue}) => {
    try {
      const records = await feeService.getFeeRecords(access);
      const payments = await feeService.getPaymentHistory(access);
      return {
        records,
        payments,
        summary: feeService.getFeeSummary(records),
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to fetch fee records');
    }
  },
);

export const uploadOfflinePayment = createAsyncThunk(
  'fees/uploadOfflinePayment',
  async (payload, {getState, rejectWithValue}) => {
    try {
      const user = getState().auth.user;
      const defaultScope = {
        role: user?.role,
        userId: user?.id,
      };
      const data = payload?.data !== undefined ? payload.data : payload;
      const scope = payload?.scope !== undefined ? payload.scope : defaultScope;
      return await feeService.uploadOfflinePayment(data, scope);
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to upload payment');
    }
  },
);

const feeSlice = createSlice({
  name: 'fees',
  initialState: {
    records: [],
    payments: [],
    selectedStudentFee: null,
    summary: {
      totalFee: 0,
      paidAmount: 0,
      dueAmount: 0,
      paidStudents: 0,
      dueStudents: 0,
      collectionRate: 0,
    },
    loading: false,
    submitting: false,
    error: null,
  },
  reducers: {
    setSelectedStudentFee: (state, action) => {
      state.selectedStudentFee = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchFees.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFees.fulfilled, (state, action) => {
        state.loading = false;
        state.records = action.payload.records;
        state.payments = action.payload.payments;
        state.summary = action.payload.summary;
      })
      .addCase(fetchFees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(uploadOfflinePayment.pending, state => {
        state.submitting = true;
      })
      .addCase(uploadOfflinePayment.fulfilled, (state, action) => {
        state.submitting = false;
        state.payments.unshift(action.payload);
      })
      .addCase(uploadOfflinePayment.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      });
  },
});

export const {setSelectedStudentFee} = feeSlice.actions;
export default feeSlice.reducer;
