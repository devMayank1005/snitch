import { RouterProvider } from 'react-router'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { initializeAuth } from '../features/auth/state/auth.slice'
import { routes } from './app.route'
import './App.css'

function App() {
  const dispatch = useDispatch()

  // Initialize auth state from localStorage on app load
  useEffect(() => {
    dispatch(initializeAuth())
  }, [dispatch])

  return (
    <>
      <RouterProvider router={routes} /> 
    </>
  )
}

export default App
