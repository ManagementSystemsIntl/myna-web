json.array!(@sections) do |section|
  json.extract! section, :id, :survey_id, :name, :code, :order, :timer_value, :skippable, :autostop, :is_publishable, :grade, :hint
  json.url section_url(section, format: :json)
  json.question_count section.questions.length
  json.direction section.survey.languages.first.direction
end
