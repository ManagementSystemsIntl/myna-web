json.extract! @question, :id, :order, :question_type_id, :section_id, :survey_id, :question_number, :choice_list_id
json.has_number @question.question_type.has_number
json.question_type @question.question_type.name
json.direction @question.survey.languages.first.direction

if @full
  json.options @question.question_type.question_options do |opt|
    json.extract! opt, :id, :name, :option_type, :translatable
  end
  json.attributes @question.question_attributes do |atty|
    json.extract! atty, :id, :question_option_id, :name, :value, :question_id, :coded_value, :order
  end
end
