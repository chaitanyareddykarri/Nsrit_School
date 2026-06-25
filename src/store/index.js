import {configureStore} from '@reduxjs/toolkit';
import attendanceReducer from './slices/attendanceSlice';
import authReducer from './slices/authSlice';
import branchReducer from './slices/branchSlice';
import classReducer from './slices/classSlice';
import feeReducer from './slices/feeSlice';
import studentReducer from './slices/studentSlice';
import userReducer from './slices/userSlice';

console.log('REDUX_STORE_INITIALIZATION_START');
export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: userReducer,
    branches: branchReducer,
    classes: classReducer,
    fees: feeReducer,
    students: studentReducer,
    attendance: attendanceReducer,
  },
});
console.log('REDUX_STORE_INITIALIZATION_END');

export default store;
