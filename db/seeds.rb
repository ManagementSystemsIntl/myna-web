puts 'ROLES'
roles= ["admin", "user", "form-builder-reader", "form-builder-admin", "dashboard-reader","dashboard-admin","data-download"]
roles.each do |role|
  Role.find_or_create_by :name => role
  puts 'role: ' << role
end

admin = Role.where(:name => 'admin')

Project.find_or_create_by :name => "MSI"

user = User.create!(email: 'test@test.com', password: 'reset_me', password_confirmation: 'reset_me', name: 'Default Admin')
user.confirm
user.add_role(:admin)
user.add_role('form-builder-admin')
user.add_role('dashboard-admin')

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

display_as = QuestionOption.find_or_create_by(:name => "display_as")
display_as.translatable = false
display_as.option_type = "string"
display_as.save!

condition = QuestionOption.find_or_create_by(:name => "condition")
condition.translatable = false
condition.option_type = "string"
condition.save!

item_name = QuestionOption.find_or_create_by(:name => "item_name")
item_name.translatable = false
item_name.option_type = "string"
item_name.save!


#----------------------------------------------------

short_text = QuestionType.find_or_create_by(:name => "short_text")
short_text.has_number = true
short_text.descriptive = "Short Text"
short_text.question_options = [prompt,condition]
short_text.question_category = generic_category
short_text.save!

long_text = QuestionType.find_or_create_by(:name => "long_text")
long_text.has_number = true
long_text.descriptive = "Long Text"
long_text.question_options = [prompt,condition]
long_text.question_category = generic_category
long_text.save!

read_text = QuestionType.find_or_create_by(:name => "readonly_text")
read_text.has_number = false
read_text.descriptive = "Read-only Text"
read_text.question_options = [prompt,condition]
read_text.question_category = generic_category
read_text.save!

grid = QuestionType.find_or_create_by(:name => "grid")
grid.has_number = false
grid.descriptive = "Grid"
grid.question_options = [grid_string,grid_timer,grid_autostop,grid_width,condition,item_name]
grid.question_category = egra_category
grid.save!

grid = QuestionType.find_or_create_by(:name => "slider")
grid.has_number = false
grid.descriptive = "Slider"
grid.question_options = [grid_string,grid_timer,grid_autostop,condition,item_name]
grid.question_category = egra_category
grid.save!

timer = QuestionType.find_or_create_by(:name => "timer")
timer.has_number = false
timer.descriptive = "Timer"
timer.question_options = [grid_timer,condition,item_name]
timer.question_category = generic_category
timer.save!

numeric = QuestionType.find_or_create_by(:name => "number")
numeric.has_number = true
numeric.descriptive = "Number"
numeric.question_options = [prompt,numeric_minimum,numeric_maximum,condition]
numeric.question_category = generic_category
numeric.save!

confirm_question = QuestionType.find_or_create_by(:name => "confirm")
confirm_question.has_number = true
confirm_question.descriptive = "Confirm"
confirm_question.question_options = [prompt,condition]
confirm_question.question_category = generic_category
confirm_question.save!

consent = QuestionType.find_or_create_by(:name => "consent")
consent.has_number = false
consent.descriptive = "Consent"
consent.question_options = [prompt,condition]
consent.question_category = generic_category
consent.save!

single_choice = QuestionType.find_or_create_by(:name => "single_choice")
single_choice.has_number = true
single_choice.descriptive = "Single Choice"
single_choice.question_options = [prompt,choice,condition,display_as]
single_choice.question_category = generic_category
single_choice.save!

multiple_choice = QuestionType.find_or_create_by(:name => "multiple_choice")
multiple_choice.has_number = true
multiple_choice.descriptive = "Multiple Choice"
multiple_choice.question_options = [prompt,choice,condition,display_as]
## would also have "display_as", but the app's build of schemaform.io requires "checkboxes"
multiple_choice.question_category = generic_category
multiple_choice.save!
