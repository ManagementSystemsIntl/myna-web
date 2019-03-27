json.array!(@question_options) do |question_option|
  json.extract! question_option, :id, :name, :option_type, :translatable
  json.url question_option_url(question_option, format: :json)
end
