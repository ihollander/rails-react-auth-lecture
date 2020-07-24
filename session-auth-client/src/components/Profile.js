import React from 'react'

class Profile extends React.Component {
  state = {
    image: this.props.currentUser.image,
    bio: this.props.currentUser.bio
  }

  handleChange = e => {
    this.setState({ [e.target.name]: e.target.value })
  }

  handleSubmit = e => {
    e.preventDefault()
    // TODO: make a fetch request to edit the current user
    fetch("http://localhost:3000/profile", {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(this.state)
    })
      .then(r => r.json())
      .then(updatedUser => {
        // then update that user in state in our App component
        this.props.updateUser(updatedUser)
      })
  }

  render() {
    const { image, bio } = this.state
    const { username } = this.props.currentUser

    return (
      <form onSubmit={this.handleSubmit}>
        <h1>{username}'s Profile</h1>

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

        <input type="submit" value="Update" />
      </form>
    )
  }
}

export default Profile