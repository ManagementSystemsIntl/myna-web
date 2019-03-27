json.extract! @section, :id, :survey_id, :name, :code, :order, :timer_value, :skippable, :autostop, :is_publishable, :grade, :hint
json.question_count @section.questions.length
json.direction @section.survey.languages.first.direction
#json.get_diff = @section.get_diff
