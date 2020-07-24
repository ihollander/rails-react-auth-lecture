class ApplicationController < ActionController::API
  include ActionController::Cookies
  
  before_action :authorized

  private

  def set_current_user!
    @current_user = User.find_by(id: session[:user_id])
  end

  def authorized
    set_current_user!
    render json: { message: "Not logged in" }, status: :unauthorized unless @current_user
  end

end
