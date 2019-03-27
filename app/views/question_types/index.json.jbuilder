json.array!(@question_types) do |question_type|
  json.extract! question_type, :id, :name, :descriptive, :has_number, :question_category_id
  json.question_category do
    json.name question_type.question_category.name
    json.descriptive question_type.question_category.descriptive
  end
  json.question_options do
    json.array!(question_type.question_options) do |option|
      json.extract! option, :id, :name
    end
  end
  json.url question_type_url(question_type, format: :json)
end
