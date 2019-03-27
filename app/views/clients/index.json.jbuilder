json.array!(@clients.reorder(:name)) do |client|
  unless @tree
    json.extract! client, :id, :name
    json.url client_url(client, format: :json)
  else
    # build sitemap json for side navigation
    json.extract! client, :id, :name
    json.url client_url(client, format: :json)
    json.survey_groups do
      json.array!(client.survey_groups.reorder('id DESC')) do |group|
        json.extract! group, :id, :client_id, :name
        json.surveys do
          json.array!(group.surveys.reorder(:name)) do |survey|
            json.extract! survey, :id, :client_id, :survey_group_id, :survey_type, :name, :grade
            json.sections do
              json.array!(survey.sections) do |section|
                json.extract! section, :id, :survey_id, :name
              end
            end
          end
        end
      end
    end
  end
end
