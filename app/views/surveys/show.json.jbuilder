json.extract! @survey, :id, :survey_type, :survey_group_id, :created_at, :updated_at, :name, :grade, :uuid, :is_clone, :version, :version_number, :cloned_from, :version_of, :is_active, :gold_standards
# json.versions do
#   json.array!(@survey.versions) do |version|
#     json.extract! version, :id, :object
#   end
# end
# json.get_diff @survey.get_diff
json.languages @survey.languages.pluck(:id).join(",")
json.direction @survey.languages.first.direction
if (@survey.survey_target)
  json.target @survey.survey_target.value
  json.irr_target @survey.survey_target.irr_value
else
  json.target nil
  json.irr_target nil
end
if @survey.schemas.length > 0
  json.last_published @survey.schemas.first.created_at.to_formatted_s(:long)
  json.last_version @survey.schemas.first.iteration
  if @include_last_schema
    json.last_schema @survey.schemas.first.json_schema
  end
else
  json.last_published "Never"
end
if @classify
  json.is_a "survey"
end
if @include_tracking
  # json.tracked survey.questions.joins(:question_attributes).merge(QuestionAttribute.where(:name => "trackable", :value => "true"))
end
if @schema
  json.schema @schema
end
#
# json.diffs do
#   json.survey @survey.get_diff
#   json.sections do
#     json.array!(@survey.sections) do |section|
#       json.section section.get_diff
#       json.questions do
#         json.array!(section.questions) do |question|
#           json.question question.get_diff
#           json.question_attributes do
#             json.array!(question.question_attributes) do |qa|
#               json.qa qa.get_diff
#             end
#           end
#         end
#       end
#     end
#   end
#   json.languages do
#     json.array!(@survey.languages) do |language|
#       json.language language.get_diff
#       json.translations do
#         json.array!(language.translations) do |translation|
#           json.translation translation.get_diff
#         end
#       end
#     end
#   end
# end
