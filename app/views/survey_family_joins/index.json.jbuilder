json.array!(@survey_family_joins) do |survey_family_join|
  json.extract! survey_family_join, :id, :survey_id, :survey_family_id, :is_random, :order
  json.url survey_family_join_url(survey_family_join, format: :json)
end
