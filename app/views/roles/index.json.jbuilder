json.array!(@roles) do |role|
  json.extract! role, :id, :name
  u = User.new
  u.roles << role
  json.abilities Ability.new(u).as_json
end
