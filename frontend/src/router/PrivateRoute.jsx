import { useAtom } from 'jotai'
import React from 'react'
import { AuthAtom } from '../Atoms/AtomStores'
import { Navigate } from 'react-router-dom';

function PrivateRoute({ children }) {
    const [auth] = useAtom(AuthAtom);
    return (
        auth?.isAuth ? children : <Navigate to={"/login"} />
    )
}

export default PrivateRoute;