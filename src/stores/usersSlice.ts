import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import supabase from "../utils/supabase.ts";
import {RootState} from "./store.ts";

export interface User {
    id: number
    name: string
    surname: string
    age: number
    email: string
}

interface UsersState {
    users: User[]
    selectedUser: User | null
    loading: boolean
    hasMore: boolean
    error: string | null
    offset: number
}

const initialState: UsersState = {
    users: [],
    selectedUser: null,
    loading: false,
    hasMore: true,
    error: null,
    offset: 0
}

export const fetchUsers = createAsyncThunk(
    'users/fetchUsers',
    async (_, { getState }) => {
        const state = getState() as RootState
        const offset = state.users.offset

        const { data, error } = await supabase
            .from('users')
            .select('*')
            .range(offset, offset + 99)

        if (error) throw new Error(error.message)
        return data
    }
)

export const updateUser = createAsyncThunk(
    'users/updateUser',
    async (user: User, { rejectWithValue }) => {
        const { error } = await supabase
            .from('users')
            .update(user)
            .eq('id', user.id);

        if (error) return rejectWithValue(error.message);
        return user;
    }
);

const usersSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        selectUser: (state, action: PayloadAction<User | null>) => {
            state.selectedUser = action.payload;
        },
        applyLocalUpdate: (state, action: PayloadAction<User>) => {
            const index = state.users.findIndex(user => user.id === action.payload.id);
            if (index !== -1) {
                state.users[index] = action.payload; // Мгновенное обновление UI
            }
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUsers.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.loading = false
                if (action.payload.length < 100) {
                    state.hasMore = false;
                }
                state.users.push(...action.payload)
                state.offset += action.payload.length
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.loading = false
                state.error = action.error.message || 'Error loading users'
            })
            .addCase(updateUser.fulfilled, (_state, action) => {
                console.log("User updated in Supabase:", action.payload);
            })
            .addCase(updateUser.rejected, (_state, action) => {
                console.error("Update failed:", action.payload);
            });
    },
});

export const { selectUser, applyLocalUpdate } = usersSlice.actions
export default usersSlice.reducer