import React from 'react'
import { Link } from 'react-router-dom'

const NavBar = ({ currentUser, handleLogout }) => {
  return (
    <header>
      <div>
        <Link to="/home">Home</Link>
      </div>
      <div>
        {currentUser ? (
          <>
            <Link to="/profile">Profile</Link>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
            <>
              <Link to="/signup">Signup</Link>
              <Link to="/login">Login</Link>
            </>
          )}
      </div>
    </header>
  )
}

export default NavBar