json.extract! @choice_list, :id, :name, :survey_group_id, :language_id
json.url choice_list_url(@choice_list, format: :json)
json.choices do
  json.array!(@choice_list.question_attributes.order(:order)) do |qa|
    json.extract! qa, :id, :name, :value, :coded_value, :order, :choice_list_id
  end
end
