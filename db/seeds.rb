puts 'ROLES'
roles= ["admin", "user", "form-builder-reader", "form-builder-admin", "dashboard-reader","dashboard-admin","data-download"]
roles.each do |role|
  Role.find_or_create_by :name => role
  puts 'role: ' << role
end

generic_category = QuestionCategory.find_or_create_by(:name => "generic")
generic_category.descriptive = "Generic Inputs"
generic_category.save!

egra_category = QuestionCategory.find_or_create_by(:name => "egra")
egra_category.descriptive = "Egra-specific Inputs"
egra_category.save!

#----------------------------------------

prompt = QuestionOption.find_or_create_by(:name => "prompt")
prompt.translatable = true
prompt.option_type = "string"
prompt.save!

grid_string = QuestionOption.find_or_create_by(:name => "grid_string")
grid_string.translatable = true
grid_string.option_type = "string"
grid_string.save!

grid_width = QuestionOption.find_or_create_by(:name => "grid_width")
grid_width.translatable = false
grid_width.option_type = "string"
grid_width.save!

grid_timer = QuestionOption.find_or_create_by(:name => "grid_timer")
grid_timer.translatable = true
grid_timer.option_type = "integer"
grid_timer.save!

grid_autostop = QuestionOption.find_or_create_by(:name => "grid_autostop")
grid_autostop.translatable = true
grid_autostop.option_type = "integer"
grid_autostop.save!

numeric_minimum = QuestionOption.find_or_create_by(:name => "minimum")
numeric_minimum.translatable = false
numeric_minimum.option_type = "integer"
numeric_minimum.save!

numeric_maximum = QuestionOption.find_or_create_by(:name =>  "maximum")
numeric_maximum.translatable = false
numeric_maximum.option_type = "integer"
numeric_maximum.save!

choice = QuestionOption.find_or_create_by(:name => "choice")
choice.translatable = true
choice.option_type = "string"
choice.save!

show_after = QuestionOption.find_or_create_by(:name => "show_after")
show_after.translatable = true
show_after.option_type = "integer"
show_after.save!

conditional_show = QuestionOption.find_or_create_by(:name => "show_if")
conditional_show.translatable = false
conditional_show.option_type = "boolean"
conditional_show.save!

show_if_question_number = QuestionOption.find_or_create_by(:name => "show_if_question_number")
show_if_question_number.translatable = false
show_if_question_number.option_type = "string"
show_if_question_number.save!

show_if_qualifier = QuestionOption.find_or_create_by(:name => "show_if_qualifier")
show_if_qualifier.translatable = false
show_if_qualifier.option_type = "string"
show_if_qualifier.save!

show_if_value = QuestionOption.find_or_create_by(:name => "show_if_value")
show_if_value.translatable = false
show_if_value.option_type = "string"
show_if_value.save!

display_as = QuestionOption.find_or_create_by(:name => "display_as")
display_as.translatable = false
display_as.option_type = "string"
display_as.save!

# trackable = QuestionOption.find_or_create_by(:name => "trackable")
# trackable.translatable = false
# trackable.option_type = "boolean"
# trackable.save!

#----------------------------------------------------

short_text = QuestionType.find_or_create_by(:name => "short_text")
short_text.has_number = true
short_text.descriptive = "Short Text"
short_text.question_options = [prompt,conditional_show,show_if_question_number,show_if_qualifier,show_if_value]
short_text.question_category = generic_category
short_text.save!

long_text = QuestionType.find_or_create_by(:name => "long_text")
long_text.has_number = true
long_text.descriptive = "Long Text"
long_text.question_options = [prompt,conditional_show,show_if_question_number,show_if_qualifier,show_if_value]
long_text.question_category = generic_category
long_text.save!

read_text = QuestionType.find_or_create_by(:name => "readonly_text")
read_text.has_number = false
read_text.descriptive = "Read-only Text"
read_text.question_options = [prompt]
read_text.question_category = generic_category
read_text.save!

grid = QuestionType.find_or_create_by(:name => "grid")
grid.has_number = false
grid.descriptive = "Grid"
grid.question_options = [prompt,grid_string,grid_timer,grid_autostop,grid_width]
grid.question_category = egra_category
grid.save!

timer = QuestionType.find_or_create_by(:name => "timer")
timer.has_number = false
timer.descriptive = "Timer"
timer.question_options = [grid_timer]
timer.question_category = generic_category
timer.save!

numeric = QuestionType.find_or_create_by(:name => "number")
numeric.has_number = true
numeric.descriptive = "Number"
numeric.question_options = [prompt,numeric_minimum,numeric_maximum,conditional_show,show_if_question_number,show_if_qualifier,show_if_value]
numeric.question_category = generic_category
numeric.save!

reading_question = QuestionType.find_or_create_by(:name => "reading_question")
reading_question.has_number = true
reading_question.descriptive = "Reading Question"
reading_question.question_options = [prompt,choice,show_after,conditional_show,show_if_question_number,show_if_qualifier,show_if_value,display_as]
reading_question.question_category = egra_category
reading_question.save!

confirm_question = QuestionType.find_or_create_by(:name => "confirm")
confirm_question.has_number = true
confirm_question.descriptive = "Confirm"
confirm_question.question_options = [prompt,conditional_show,show_if_question_number,show_if_qualifier,show_if_value]
confirm_question.question_category = generic_category
confirm_question.save!

consent = QuestionType.find_or_create_by(:name => "consent")
consent.has_number = false
consent.descriptive = "Consent"
consent.question_options = [prompt]
consent.question_category = generic_category
consent.save!

single_choice = QuestionType.find_or_create_by(:name => "single_choice")
single_choice.has_number = true
single_choice.descriptive = "Single Choice"
single_choice.question_options = [prompt,choice,conditional_show,show_if_question_number,show_if_qualifier,show_if_value,display_as]
single_choice.question_category = generic_category
single_choice.save!

multiple_choice = QuestionType.find_or_create_by(:name => "multiple_choice")
multiple_choice.has_number = true
multiple_choice.descriptive = "Multiple Choice"
multiple_choice.question_options = [prompt,choice,conditional_show,show_if_question_number,show_if_qualifier,show_if_value]
## would also have "display_as", but the app's build of schemaform.io requires "checkboxes"
multiple_choice.question_category = generic_category
multiple_choice.save!
