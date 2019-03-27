json.array!(@translations) do |translation|
  json.extract! translation, :id, :value, :language_id, :question_attribute_id
  json.url translation_url(translation, format: :json)
end
