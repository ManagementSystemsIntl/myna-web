json.extract! @device, :id, :serial_number, :version, :app_version, :platform, :cordova, :model, :uuid, :external_code, :updated_at, :created_at
json.survey_group @device.survey_group
