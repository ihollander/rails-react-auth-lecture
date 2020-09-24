import React from 'react'
import { GoogleLogin } from 'react-google-login';

class Login extends React.Component {
  state = {
    username: "",
    password: ""
  }

  responseGoogle = (response) => {
    // In the responseGoogle(response) {...} callback function, you should get back a standard JWT located at response.tokenId or res.getAuthResponse().id_token
    if (response.tokenId) {
      fetch("http://localhost:3000/google_login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${response.tokenId}`
        }
      })
      //   .then(r => r.json())
      //   .then(user => {
      //     this.props.handleLogin(user)
      //   })
      /* 
      Send this token to your server (preferably as an Authorization header)
      Have your server decode the id_token by using a common JWT library such as jwt-simple or by sending a GET request to https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=YOUR_TOKEN_HERE
      The returned decoded token should have an hd key equal to the hosted domain you'd like to restrict to.
      */
      console.log(response);
    }
  }

  handleChange = e => {
    this.setState({ [e.target.name]: e.target.value })
  }

  handleSubmit = e => {
    e.preventDefault()
    // TODO: make a fetch request to login the current user
    // then set that user in state in our App component
    fetch("http://localhost:3000/login", {
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
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <h1>Login</h1>
          <label>Username</label>
          <input type="text" name="username" autoComplete="off" value={this.state.username} onChange={this.handleChange} />
          <label>Password</label>
          <input type="password" name="password" value={this.state.password} onChange={this.handleChange} autoComplete="current-password" />
          <input type="submit" value="Login" />
        </form>
        <hr />
        <div>
          <GoogleLogin
            clientId={process.env.REACT_APP_GOOGLE_OAUTH_CLIENT_ID}
            buttonText="Login"
            onSuccess={this.responseGoogle}
            onFailure={this.responseGoogle}
            cookiePolicy={'single_host_origin'}
          />
        </div>
      </div>
    )
  }
}

export default Login