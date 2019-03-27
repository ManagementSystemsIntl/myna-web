json.array!(@question_categories) do |question_category|
  json.extract! question_category, :id, :name, :descriptive
  json.url question_category_url(question_category, format: :json)
end
