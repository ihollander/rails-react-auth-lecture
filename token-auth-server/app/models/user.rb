class User < ApplicationRecord
  has_secure_password

  validates :username, uniqueness: { case_sensitive: false }

  def self.from_google_signin(payload)
    User.where(username: payload["email"]).first_or_create do |new_user|
      new_user.username = payload["email"]
      new_user.avatar = payload["picture"]
      new_user.password = SecureRandom.base64(15)
    end
  end
  
end
