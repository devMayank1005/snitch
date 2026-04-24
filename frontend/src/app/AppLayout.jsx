import React from 'react'
import Nav from '../features/Shared/Components/Nav.jsx'
import { Outlet } from 'react-router'
import { ConfirmModalProvider } from './confirm-modal.context.jsx'

const AppLayout = () => {
    return (
        <ConfirmModalProvider>
            <Nav />
            <Outlet />
        </ConfirmModalProvider>

    )
}

export default AppLayout