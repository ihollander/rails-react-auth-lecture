class UserSerializer < ActiveModel::Serializer
  attributes :username, :bio, :avatar
end
