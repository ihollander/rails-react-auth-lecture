Rails.application.routes.draw do
  
  resources :users, only: [:create]
  post "/login", to: "users#login"
  get "/autologin", to: "users#autologin"
  get "/logout", to: "users#logout"
  patch "/profile", to: "users#profile"

end
