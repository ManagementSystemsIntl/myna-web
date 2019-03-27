json.array!(@question_attributes) do |question_attribute|
  json.extract! question_attribute, :id, :name, :value, :question_option_id, :coded_value, :order
  json.question_option do
    json.extract! question_attribute.question_option, :id, :option_type
  end
  json.question do
    json.extract! question_attribute.question, :id, :order, :question_type_id, :section_id, :survey_id
    json.survey do
      json.extract! question_attribute.question.survey, :id, :survey_type, :name, :grade, :uuid
    end
    json.section do
      json.extract! question_attribute.question.section, :id, :name, :code, :order, :timer_value, :skippable, :autostop
    end
    json.question_type do
      json.extract! question_attribute.question.question_type, :id, :name, :descriptive
    end
  end
  json.url question_attribute_url(question_attribute, format: :json)
end
