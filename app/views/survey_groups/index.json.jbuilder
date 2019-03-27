json.array!(@survey_groups.reorder(:name)) do |survey_group|
  unless @tree
    json.extract! survey_group, :id, :name
    json.url survey_group_url(survey_group, format: :json)
  else
    # build sitemap json for side navigation
    json.extract! survey_group, :id, :name
    json.url survey_group_url(survey_group, format: :json)
    json.surveys do
      json.array!(survey_group.surveys.reorder(:name)) do |survey|
        json.extract! survey, :id, :survey_group_id, :survey_type, :name, :grade
      end
    end
  end
end
