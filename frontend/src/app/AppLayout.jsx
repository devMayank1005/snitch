import React from 'react'
import Nav from '../features/Shared/Components/Nav.jsx'
import { Outlet } from 'react-router'

const AppLayout = () => {
    return (
        <>
            <Nav />
            <Outlet />
        </>

    )
}

export default AppLayout