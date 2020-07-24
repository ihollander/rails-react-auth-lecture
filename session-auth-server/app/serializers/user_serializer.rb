class UserSerializer < ActiveModel::Serializer
  attributes :username, :bio, :image
end
