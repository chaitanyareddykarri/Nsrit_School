import {createSlice} from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'users',
  initialState: {
    items: [],
    selectedUser: null,
    loading: false,
    error: null,
  },
  reducers: {
    setUsers: (state, action) => {
      state.items = action.payload;
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
  },
});

export const {setUsers, setSelectedUser} = userSlice.actions;
export default userSlice.reducer;
