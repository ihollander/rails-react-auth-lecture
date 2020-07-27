class UsersController < ApplicationController
  skip_before_action :authenticate, only: [:create, :login]

  def create
    user = User.create(
      username: params[:username],
      password: params[:password],
      bio: params[:bio],
      avatar: params[:avatar],
    )

    if user.valid?
      token = encode_token({ user_id: user.id })

      render json: { user: UserSerializer.new(user), token: token }, status: :created
    else
      render json: { error: user.errors.full_messages }, status: :bad_request
    end
  end
  

  def login
    user = User.find_by(username: params[:username])
    
    if user && user.authenticate(params[:password])
      token = encode_token({ user_id: user.id })

      render json: { user: UserSerializer.new(user), token: token }
      
      # render json: user # implicitly run serializer
    else
      render json: { error: "Invalid username or password" }, status: :unauthorized
    end
  end

  # before_action :authenticate
  def autologin
    render json: @current_user
  end

  # before_action :authenticate
  def profile
    # find that use in the database (happens in the authenticate before_action)
    @current_user.update(bio: params[:bio], avatar: params[:avatar])

    render json: @current_user
  end

end
