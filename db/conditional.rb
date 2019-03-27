## Migrate old conditionals to new conditionals
# QuestionOption.find_by(:name => 'condition').destroy
# QuestionAttribute.where(:name => 'condition').destroy_all
#
# conditional = QuestionOption.create(:option_type => "string", :name => "condition", :translatable => false)
# QuestionType.all.each do |qt|
#   qt.question_options << conditional
# end
#
# show_afters = QuestionAttribute.where(:name => 'show_after')
# show_ifs = QuestionAttribute.where(:name => 'show_if', :value => 'true')
#
# show_afters.each do |sa|
#   QuestionAttribute.create(:question_id => sa.question_id, :question_option_id => conditional.id, :name => conditional.name, :value => "$#{sa.question.section.code}_grid_1.lastRead >= #{sa.value}")
# end
#
# show_ifs.each do |si|
#   qualifier = si.question.question_attributes.find_by(:name => 'show_if_qualifier')
#   value = si.question.question_attributes.find_by(:name => 'show_if_value')
#   question_number = si.question.question_attributes.find_by(:name => 'show_if_question_number')
#   QuestionAttribute.create(:question_id => si.question_id, :question_option_id => conditional.id, :name => conditional.name, :value => "$#{question_number.value} #{qualifier.value} #{value.value}")
# end
#
# QuestionOption.where(name: ['show_if_value', 'show_if', 'show_if_qualifier', 'show_if_question_number', 'show_after']).destroy_all
# QuestionAttribute.where(name: ['show_if_value', 'show_if', 'show_if_qualifier', 'show_if_question_number', 'show_after']).destroy_all


# # change reading questions to single choice
# scqt = QuestionType.find_by(:name => 'single_choice')
# rqt = QuestionType.find_by(:name => 'reading_question')
# rqs = Question.where(:question_type_id => rqt.id)
# rqs.each do |rq|
#   rq.update(:question_type_id => scqt.id)
# end
# rqt.destroy

# # add item_name attribute for grids and timers
# item_name = QuestionOption.create(:name => 'item_name', :option_type => 'string', :translatable => false)
# QuestionType.where(name: ['grid', 'timer']).each do |qt|
#   qt.question_options << item_name
# end
# grid = QuestionType.find_by(:name => "grid")
# timer = QuestionType.find_by(:name => "timer")
# grids = Question.where(:question_type_id => grid.id)
# timers = Question.where(:question_type_id => timer.id)
# grids.each do |g|
#   g.question_attributes << QuestionAttribute.create(:question_option_id => item_name.id, :name => item_name.name, :value => 'grid_1', :question_id => g.id)
# end
# timers.each do |t|
#   t.question_attributes << QuestionAttribute.create(:question_option_id => item_name.id, :name => item_name.name, :value => 'timer_1', :question_id => t.id)
# end
