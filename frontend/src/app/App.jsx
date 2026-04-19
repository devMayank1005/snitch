import { RouterProvider } from 'react-router'
import {routes} from './app.route'
import './App.css'

function App() {
  

  return (
    <>
   <RouterProvider router={routes} /> 
    </>
  )
}

export default App
