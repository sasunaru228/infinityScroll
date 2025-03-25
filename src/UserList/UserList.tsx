import {ChangeEvent, useCallback, useEffect, useRef, useState} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {fetchUsers, selectUser, applyLocalUpdate, updateUser, User} from '../stores/usersSlice.ts';
import {AppDispatch, RootState} from "../stores/store.ts";
import classes from './UserList.module.css'

const UsersList = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { users, selectedUser, loading, hasMore, error } = useSelector((state: RootState) => state.users);
    const [editableUser, setEditableUser] = useState(selectedUser)
    const hasFetched = useRef(false)

    const loadMoreUsers = useCallback(() => {
        if (hasMore && !loading) {
            console.log('load more users')
            dispatch(fetchUsers())
        }
    }, [dispatch, hasMore, loading])

    useEffect(() => {
        if (!hasFetched.current) {
            hasFetched.current = true;
            dispatch(fetchUsers())
        }
    }, [dispatch])

    useEffect(() => {
        setEditableUser(selectedUser)
    }, [selectedUser])

    const handleUserClick = (user: User) => {
        dispatch(selectUser(user))
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (!editableUser) return
        setEditableUser({ ...editableUser, [e.target.name]: e.target.value })
    };

    const handleSave = () => {
        if (!editableUser) return;
        dispatch(applyLocalUpdate(editableUser)) // обновляем UI мгновенно
        dispatch(updateUser(editableUser)) // отправляем в Supabase
    }

    useEffect(() => {
        const handleScroll = () => {
            const list = document.getElementById('users-list')
            if (!list) return

            const { scrollTop, scrollHeight, clientHeight } = list
            const scrollPosition = scrollTop + clientHeight

            if (scrollPosition >= scrollHeight * 0.5) {
                loadMoreUsers()
            }
        };

        const list = document.getElementById('users-list')
        if (list) list.addEventListener('scroll', handleScroll)

        return () => {
            if (list) list.removeEventListener('scroll', handleScroll)
        }
    }, [loadMoreUsers])

    if (loading && users.length === 0) return <p>Loading...</p>
    if (error) return <p>{error}</p>
    return (
        <div className={classes.container}>
            <div
                id="users-list"
                className={classes.container_userList}
            >
                {users.map((user) => (
                    <span
                        key={user.id}
                        onClick={() => handleUserClick(user)}
                        style={{display: 'block'}}
                    >
                        {user.name}
                    </span>
                ))}
                {loading && <p>Loading more...</p>}
                {!hasMore && <p>No more users</p>}
            </div>
            {selectedUser ? (
                <div
                    className={classes.container_userForm}
                >
                    <h3>Редактирование</h3>
                    <input type="text" name="name" value={editableUser?.name || ''} onChange={handleChange} />
                    <input type="text" name="surname" value={editableUser?.surname || ''} onChange={handleChange} />
                    <input type="number" name="age" value={editableUser?.age || ''} onChange={handleChange} />
                    <input type="email" name="email" value={editableUser?.email || ''} onChange={handleChange} />
                    <button onClick={handleSave}>Сохранить</button>
                </div>
            ): <div className={classes.userDontSelected}>user dont selected</div>}

        </div>

    );
};

export default UsersList;