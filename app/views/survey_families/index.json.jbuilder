json.array!(@survey_families) do |survey_family|
  json.extract! survey_family, :id, :name, :survey_group_id, :is_active, :gold_standards, :uuid
  json.schema survey_family.family_schema
  if (survey_family.survey_target)
    json.target survey_family.survey_target.value
    json.irr_target survey_family.survey_target.irr_value
  else
    json.target nil
    json.irr_target nil
  end
  if @classify
    json.is_a "survey_family"
  end
  json.url survey_family_url(survey_family, format: :json)
  json.surveys do
    json.array!(survey_family.surveys) do |survey|
      json.extract! survey, :id, :uuid, :name, :grade, :survey_type
      join = survey.survey_family_joins.find_by(:survey_family_id => survey_family.id)
      json.random join.is_random
      json.order join.order
    end
  end
  if survey_family.schemas.length > 0
    json.last_published survey_family.schemas.first.created_at.to_formatted_s(:long)
    json.last_version survey_family.schemas.first.iteration
  else
    json.last_published "Never"
  end
end
