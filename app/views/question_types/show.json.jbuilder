json.extract! @question_type, :id, :name, :created_at, :updated_at, :descriptive, :has_number, :question_category_id
json.question_category do
  json.name @question_type.question_category.name
  json.descriptive @question_type.question_category.descriptive
end
