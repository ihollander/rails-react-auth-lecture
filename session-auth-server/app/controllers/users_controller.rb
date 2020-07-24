class UsersController < ApplicationController
  skip_before_action :authorized, only: [:create, :login]
  
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

end
