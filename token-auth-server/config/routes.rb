Rails.application.routes.draw do
  resources :users, only: [:create]
  post "/login", to: "users#login"
  get "/autologin", to: "users#autologin"
  patch "/profile", to: "users#profile"
  post "/google_login", to: "users#google_login"
end
