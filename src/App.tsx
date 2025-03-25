import './App.css'
import {Provider} from "react-redux";
import UserList from "./UserList/UserList.tsx";
import { store } from './stores/store.ts';

function App() {
    return (
        <Provider store={store}>
            <UserList/>
        </Provider>

    )
}

export default App
