import React from 'react'
import useAuth from '../hooks/useAuth'
const Login = () => {

    const {LoginButton} = useAuth()
  return (
    <div style={{color:"black"}}>

      logn page

      <LoginButton/>
      
    </div>
  )
}

export default Login
