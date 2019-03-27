json.array!(@connections) do |connection|
  json.extract! connection, :id, :device_id, :survey_group_id, :created_at, :active
  json.url connection_url(connection, format: :json)
end
