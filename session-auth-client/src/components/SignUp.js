import React from 'react'

class SignUp extends React.Component {
  state = {
    username: "",
    image: "",
    bio: "",
    password: ""
  }

  handleChange = e => {
    this.setState({ [e.target.name]: e.target.value })
  }

  handleSubmit = e => {
    e.preventDefault()
    // TODO: make a fetch request to sign up the current user
    // then set that user in state in our App component
    fetch("http://localhost:3000/users", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(this.state)
    })
      .then(r => r.json())
      .then(user => {
        this.props.handleLogin(user)
      })
  }

  render() {
    const { username, image, bio, password } = this.state

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
          name="image"
          autoComplete="off"
          value={image}
          onChange={this.handleChange}
        />
        <img src={image.length ? image : "https://cdn.iconscout.com/icon/free/png-512/account-profile-avatar-man-circle-round-user-30452.png"} alt={username} />

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