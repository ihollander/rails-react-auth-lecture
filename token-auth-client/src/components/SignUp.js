import React from 'react'

class SignUp extends React.Component {
  state = {
    username: "",
    avatar: "",
    bio: "",
    password: ""
  }

  handleChange = e => {
    this.setState({ [e.target.name]: e.target.value })
  }

  handleSubmit = e => {
    e.preventDefault()
    // TODO: make a fetch request to sign up the current user
    fetch("http://localhost:3000/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(this.state)
    })
      .then(r => r.json())
      // then set that user in state in our App component
      .then(data => {
        const { user, token } = data

        this.props.handleLogin(user)
        // also save the id to localStorage
        localStorage.token = token
      })
  }

  render() {
    const { username, avatar, bio, password } = this.state

    return (
      <form onSubmit={this.handleSubmit}>
        <h1>Signup</h1>

        <label>Username</label>
        <input
          type="text"
          name="username"
          autoComplete="off"
          value={username}
          onChange={this.handleChange}
        />

        <label>Profile Image</label>
        <input
          type="text"
          name="avatar"
          autoComplete="off"
          value={avatar}
          onChange={this.handleChange}
        />
        <img src={avatar.length ? avatar : "https://cdn.iconscout.com/icon/free/png-512/account-profile-avatar-man-circle-round-user-30452.png"} alt={username} />

        <label>Bio</label>
        <textarea
          name="bio"
          value={bio}
          onChange={this.handleChange}
        />

        <label>Password</label>
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={this.handleChange}
        />

        <input type="submit" value="Signup" />
      </form>
    )
  }
}

export default SignUp