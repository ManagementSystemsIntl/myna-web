json.array!(@surveys) do |survey|
  json.extract! survey, :id, :survey_type, :survey_group_id, :name, :grade, :uuid, :is_clone, :version, :version_number, :cloned_from, :version_of, :is_active, :gold_standards
  json.version_count survey.versions.length + 1
  if (survey.survey_target)
    json.target survey.survey_target.value
    json.irr_target survey.survey_target.irr_value
  else
    json.target nil
    json.irr_target nil
  end
  if @classify
    json.is_a "survey"
  end
  if @include_tracking
    # json.tracked survey.questions.joins(:question_attributes).merge(QuestionAttribute.where(:name => "trackable", :value => "true"))
  end
  if survey.schemas.length > 0
    json.last_published survey.schemas.first.created_at.to_formatted_s(:long)
    json.last_version survey.schemas.first.iteration
    if @include_last_schema
      json.last_schema survey.schemas.first.json_schema
    end
  else
    json.last_published "Never"
  end
  json.url survey_url(survey, format: :json)
end
