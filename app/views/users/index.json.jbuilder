json.array!(@users) do |user|
  json.extract! user, :id, :name, :email
  json.confirmed user.confirmed?
  json.roles user.roles.each do |r|
    json.extract! r, :id, :name
  end
  json.url user_url(user, format: :json)
end
