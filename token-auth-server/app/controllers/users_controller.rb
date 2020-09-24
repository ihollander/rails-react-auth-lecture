class UsersController < ApplicationController
  skip_before_action :authenticate, only: [:create, :login, :google_login]

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

  def google_login
    payload = get_google_token_payload
    if payload
      # find/create user from payload
      user = User.from_google_signin(payload)

      # if the user exists or was successfully created
      if user
        # save user_id in token so we can use it in future requests
        token = encode_token({ user_id: user.id })

        # send token and user in response
        render json: { user: UserSerializer.new(user), token: token }
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
        p "Cannot validate: #{e}"
      end
    end
  end

end
