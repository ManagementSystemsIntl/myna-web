json.extract! @user, :id, :name, :email, :created_at, :updated_at
json.abilities Ability.new(@user).as_json
json.confirmed @user.confirmed?
json.roles @user.roles.each do |r|
  json.extract! r, :id, :name
end
