json.extract! @pouch_key, :id, :username, :pwd, :db_name, :db_address, :survey_group_id, :created_at, :updated_at, :external_key
json.group_name @pouch_key.survey_group.name
