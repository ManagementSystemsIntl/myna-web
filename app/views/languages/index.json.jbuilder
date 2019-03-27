json.array!(@languages) do |language|
  json.extract! language, :id, :name, :survey_group_id, :direction
  json.url language_path(language)
end
