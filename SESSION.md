# Session-based Rails API Auth

Today we're going to take a look at using Rails sessions as a way of authenticating requests to our API from a separate frontend service. There are many different auth strategies out there, and they all come with some tradeoffs; this approach will hopefully feel similar to your experience learning Auth in Rails in Mod 2.

The motivation: 

- Rails has a great mechanism for session-based auth that's built-in and battle-tested
- HTTPOnly cookies are secure from cross-site scripting (XSS) attacks, while [localstorage is not](https://stackoverflow.com/questions/35291573/csrf-protection-with-json-web-tokens/35347022#35347022)

**Disclaimer 1**: This readme only covers the basics and there are still some additional security concerns to be aware of with this approach. Consider implementing [CSRF tokens](https://pragmaticstudio.com/tutorials/rails-session-cookies-for-api-authentication) and [enabling secure cookies](https://api.rubyonrails.org/classes/ActionDispatch/Session/CookieStore.html) if you deploy your app to a secure domain.

**Disclaimer 2**: Using this strategy means your API will only be accessible from browser-based clients, since we're relying on cookies as the authentication mechanism. That means if you're planning on making a React Native client or other mobile frontend, this strategy won't work. It also will make testing your API using Postman more challenging. For an alternate auth approach using JWT tokens, have a look at [this readme](https://github.com/learn-co-curriculum/jwt-auth-rails). You could also consider using JWT tokens and storing them in cookies, which would give you the added protection of using HTTPOnly cookie storage in browsers - have a look at this [terrific blog](https://www.thegreatcodeadventure.com/jwt-storage-in-rails-the-right-way/) for more details on that.

Finished code for this project is in `session-auth-api` (Rails) and `session-auth-client` (React).

If you want to code along, create a new Rails app:

```sh
$ rails new project-name-backend --api --database=postgresql
```

If you'd rather use the pre-built app, `cd` into `session-auth-api` and run:

```sh
$ bundle
$ rails db:migrate
$ rails s
```

There's also a pre-build React client app - to get that running, `cd` into `session-auth-client` and run:

```sh
$ npm install
$ npm start
```

## Rails

### Gems
Time to get our app up and running! Let's take care of setting up our Gemfile for this project with all the necessary dependencies. 

First, uncomment the `rack-cors` and `bcrypt` gems.

Then, run:

```sh
$ bundle add active_model_serializers 
$ bundle install
```

### Config 

We'll need to configure a couple of things right off the bat, since the default configuration for Rails with the `--api` flag doesn't enable cookies or sessions.

First, we need to add in middleware for cookies and sessions in our config:

```rb
  # in config/application.rb
module SessionAuthApi
  class Application < Rails::Application
    # keep all the default configuration, which should look like this:
    config.load_defaults 6.0
    config.api_only = true

    # add this at the end
    config.middleware.use ActionDispatch::Cookies
    config.middleware.use ActionDispatch::Session::CookieStore
  end
end

```

We also need to setup CORS. In `config/initializers/cors.rb` file, the `*` (wildcard) origin isn't an option if you want to send cookies in a CORS request - we need to specify the origins we're allowing. We also need to include `credentials: true` here to set the `Access-Control-Allow-Credentials` header to `true`.

```rb
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    # origins '*' won't work!
    origins 'localhost:3001' # Make sure to change this when you deploy!

    resource '*',
      headers: :any,
      credentials: true,
      methods: [:get, :post, :put, :patch, :delete, :options, :head]
  end
end
```

Finally, we also have to setup our controllers to send cookies.

```rb
class ApplicationController < ActionController::API
  include ActionController::Cookies
end
```

### Authenticating
With that configuration done, let's make a User model and a few resources to test our session auth:

```sh
$ rails g resource User username password_digest
```

Let's make sure our User class is set up to use BCrypt and has some validations:


```rb
# app/models/user.rb
class User < ApplicationRecord
  has_secure_password

  validates :username, presence: true, uniqueness: { case_sensitive: false }
end
```

Let's also configure the serializer so it only sends the username:

```rb
# app/serializers/user_serializer.rb
class UserSerializer < ActiveModel::Serializer
  attributes :username
end
```

Then let's configure some routes for authentication:

```rb
# config/routes.rb
Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      post "/signup", to: "users#signup"
      post "/login", to: "users#login"
      post "/logout", to: "users#logout"
      get "/autologin", to: "users#autologin"
    end
  end
end
```

Now for some controller setup. First, let's setup our ApplicationController to handle some authorization logic:

```rb
# app/controllers/application_controller.rb
class ApplicationController < ActionController::API
  include ActionController::Cookies
  
  before_action :authorized
  
  private 
  
  def current_user
    @current_user = User.find_by(id: session[:user_id])
  end
  
  def logged_in?
    !!current_user
  end
  
  def authorized
    render json: { message: 'Please log in' }, status: :unauthorized unless logged_in?
  end
  
end
```

Then let's set up our UsersController to enable our auth actions: 

```rb
# app/controllers/api/v1/user_controller.rb
class Api::V1::UsersController < ApplicationController
  # authorized (from ApplicationController) will run before EVERY action except login and signup
  skip_before_action :authorized, only: [:login, :signup]

  def login
    # login looks for an existing user by their username
    user = User.find_by(username: params[:username])

    # it uses the authenticate method from BCrypt to check their hashed password
    if user && user.authenticate(params[:password])
      # if they are authenticated, set the user_id in the session cookie
      session[:user_id] = user.id
      render json: user
    else
      # otherwise, they're not authenticated
      render json: { errors: "Invalid username or password" }, status: :unauthorized
    end
  end

  # signup creates a new user
  def signup
    user = User.create(username: params[:username], password: params[:password])

    if user.valid?
      # if the user is created successfully, set the user_id in the session cookie
      session[:user_id] = user.id
      render json: user, status: :created
    else
      # otherwise, let them try signing up again
      render json: { errors: user.errors.full_messages }, status: :bad_request
    end
  end

  # this action can be used to authenticate a user when the client app first loads (in componentDidMount in App, for example)
  # make sure the authenticate before_action runs before this (since we need the @current_user instance variable set)
  def autologin
    render json: @current_user
  end

  def logout
    session.delete(:user_id)

    render json: { message: "Logged out" }
  end

end
```

With our API set up, let's have a look at our frontend.

## React

We're still going to be communicating between our frontend and backend using `fetch`, but now in addition to sending what we've typically been (headers, method, body), we also need to make fetch include our cookies as part of all requests. To do this, all we need to do is use the `credentials: "include"` option in our fetch request:

```js
fetch("http://localhost:3000/api/v1/autologin/", {
  credentials: "include"
})
```

This will ensure that cookies are encluded as part of the `fetch` request for cross-origin requests - [MDN Request.credentials](https://developer.mozilla.org/en-US/docs/Web/API/Request/credentials). Since our frontend and backend are on separate origins, this option is necessary for all requests that need our session cookie.

To test our sessions, try making a signup request in your frontend (you can do this from the browser console, but make sure you're on `localhost:3001`):

```js
fetch("http://localhost:3000/api/v1/signup", {
  method: "POST",
  credentials: "include",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ username: "test_user", password: "123" })
})
```

In the network tab, the response should look something like this:

![signup response](screenshots/signup.png?raw=true)

If the Access-Control headers look different, check your CORS config file on the server. Also, make sure you have `credentials: "include"` in your fetch options.

After signing up, try using the autologin route to check if your requests are authenticated:

```js
fetch("http://localhost:3000/api/v1/autologin/", {
  credentials: "include"
})
```

In the network tab, the request should look something like this:

![autologin response](screenshots/autologin.png?raw=true)

Check that the cookie is being sent as part of the request headers; if not, double-check that **all** your fetch requests have `credentials: "include"`.

Play around with the sample app and drop some `byebug`s in your backend when the fetches come through to get a sense of how the auth flow works! Pay close attention in particular to the actions in the ApplicationController.

## Resources

- [Rails API Auth with Session Cookies](https://pragmaticstudio.com/tutorials/rails-session-cookies-for-api-authentication)
  - this also shows how to enable CSRF protection for added security
- [JWT Storage in Rails + React](https://www.thegreatcodeadventure.com/jwt-storage-in-rails-the-right-way/)
  - this advocates for using JWT tokens instead of Rails sessions as an auth mechanism, but it's a useful resource for seeing how to use HTTPOnly cookies