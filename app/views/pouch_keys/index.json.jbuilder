json.array!(@pouch_keys) do |pouch_key|
  json.extract! pouch_key, :id, :username, :pwd, :db_name, :db_address, :survey_group_id, :external_key
  json.url pouch_key_url(pouch_key, format: :json)
end
