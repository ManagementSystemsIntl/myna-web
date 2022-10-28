namespace :question_types do
  desc "generate the slider question type"
  task generate_slider: :environment do
    grid_string = QuestionOption.find_or_create_by(:name => "grid_string")
    grid_timer = QuestionOption.find_or_create_by(:name => "grid_timer")
    grid_autostop = QuestionOption.find_or_create_by(:name => "grid_autostop")
    condition = QuestionOption.find_or_create_by(:name => "condition")
    item_name = QuestionOption.find_or_create_by(:name => "item_name")
    egra_category = QuestionCategory.find_or_create_by(:name => "egra")

    slider = QuestionType.find_or_create_by(:name => "slider")
    slider.has_number = false
    slider.descriptive = "Slider"
    slider.question_options = [grid_string,grid_timer,grid_autostop,condition,item_name]
    slider.question_category = egra_category
    slider.save!
  end

end
