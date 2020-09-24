class UsersController < ApplicationController
  skip_before_action :authorized, only: [:create, :login, :google_login]

  def create
    # create a user in the database
    user = User.create(
      username: params[:username], 
      password: params[:password],
      bio: params[:bio],
      image: params[:image],
    )

    # validate the user
    if user.valid?
      # save user_id in session so we can use it in future requests
      session[:user_id] = user.id
      # return the user in the response
      render json: user
    else
      # for invalid users, send error messages to the front end
      render json: { message: user.errors.full_messages }, status: :bad_request
    end
  end

  def login
    # find the user by their username
    user = User.find_by(username: params[:username])

    # if the user exists and their password matches, log them in
    if user && user.authenticate(params[:password])
      # save user_id in session so we can use it in future requests
      session[:user_id] = user.id
      # return the user in the response
      render json: user
    else
      # for invalid username/password combos, send error messages to the front end
      render json: { message: "Invalid username or password" }, status: :unauthorized
    end
  end

  # before_action :authorized
  # @current_user
  def autologin
    # if we find the user, send back the user as the response
    render json: @current_user
  end

  # before_action :authorized
  def profile
    # if we find the user, update the user
    @current_user.update(image: params[:image], bio: params[:bio])
    # send back the updated user as the response
    render json: @current_user
  end

  def logout
    # to log the user out, remove their user_id from the session cookie
    session.delete(:user_id)

    # send some response to our frontend so we know the request succeeded
    render json: { message: "Logged Out" }
  end

  def google_login
    payload = get_google_token_payload
    if payload
      # find/create user from payload
      user = User.from_google_signin(payload)

      # if the user exists or was successfully created
      if user
        # save user_id in session so we can use it in future requests
        session[:user_id] = user.id
        # return the user in the response
        render json: user
        return
      end
    end
    
    # for invalid username/password combos, send error messages to the front end
    render json: { message: "Could not log in" }, status: :unauthorized
  end

  # TODO: refactor lol
  private

  def get_google_token_payload
    if request.headers["Authorization"]
      token_id = request.headers["Authorization"].split(" ")[1]
      validator = GoogleIDToken::Validator.new
      begin
        validator.check(token_id, ENV["GOOGLE_OAUTH_CLIENT_ID"])
      rescue GoogleIDToken::ValidationError => e
        report "Cannot validate: #{e}"
      end
    end
  end

end
