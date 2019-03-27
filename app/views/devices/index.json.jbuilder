json.array!(@devices) do |device|
  json.extract! device, :id, :serial_number, :version, :app_version, :platform, :cordova, :model, :uuid, :external_code, :updated_at, :created_at
  json.survey_group device.survey_group
  json.last_connection device.connections.last
  json.url device_url(device, format: :json)
end
