class ConvertMultipleChoiceToNewQuestionTypes < ActiveRecord::Migration
  def change

    ynna = QuestionType.find_by(:name => "ynna")
    cina = QuestionType.find_by(:name => "cina")
    read_to_student = QuestionType.find_by(:name => "read_to_student")
    enumerator_instructions = QuestionType.find_by(:name => "enumerator_instructions")
    custom_select = QuestionType.find_by(:name => "custom_select")
    custom_checkboxes = QuestionType.find_by(:name => "custom_checkboxes")
    custom_radios = QuestionType.find_by(:name => "custom_radios")
    custom_buttons = QuestionType.find_by(:name => "custom_buttons")

    readonly_text = QuestionType.find_by(:name => "readonly_text")
    choose_one = QuestionType.find_by(:name => "single_choice")
    choose_many = QuestionType.find_by(:name => "multiple_choice")
    display_as = QuestionOption.find_by(:name => "display_as")

    # convert to readonly_text
    read_to_student_questions = Question.where(:question_type_id => read_to_student.id)
    read_to_student_questions.each do |q|
      q.question_type_id = readonly_text.id
      q.save
    end
    read_to_student.destroy

    enumerator_instructions_questions = Question.where(:question_type_id => enumerator_instructions.id)
    enumerator_instructions_questions.each do |q|
      q.question_type_id = readonly_text.id
      q.save
    end
    enumerator_instructions.destroy

    # convert to choose_one
    custom_select_questions = Question.where(:question_type_id => custom_select.id)
    custom_select_questions.each do |q|
      q.question_type_id = choose_one.id
      q.save
      q.question_attributes << QuestionAttribute.create(:question_option_id => display_as.id, :name => display_as.name, :value => "select")
    end
    custom_select.destroy

    custom_radios_questions = Question.where(:question_type_id => custom_radios.id)
    custom_radios_questions.each do |q|
      q.question_type_id = choose_one.id
      q.save
      q.question_attributes << QuestionAttribute.create(:question_option_id => display_as.id, :name => display_as.name, :value => "radios")
    end
    custom_radios.destroy

    custom_buttons_questions = Question.where(:question_type_id => custom_buttons.id)
    custom_buttons_questions.each do |q|
      q.question_type_id = choose_one.id
      q.save
      q.question_attributes << QuestionAttribute.create(:question_option_id => display_as.id, :name => display_as.name, :value => "radiobuttons")
    end
    custom_buttons.destroy

    ynna_questions = Question.where(:question_type_id => ynna.id)
    ynna_questions.each do |q|
      q.question_type_id = choose_one.id
      q.save
      q.question_attributes << QuestionAttribute.create(:question_option_id => display_as.id, :name => display_as.name, :value => "radiobuttons")
    end
    ynna.destroy

    cina_questions = Question.where(:question_type_id => cina.id)
    cina_questions.each do |q|
      q.question_type_id = choose_one.id
      q.save
      q.question_attributes << QuestionAttribute.create(:question_option_id => display_as.id, :name => display_as.name, :value => "radiobuttons")
    end
    cina.destroy

    # convert to choose_many
    custom_checkboxes_questions = Question.where(:question_type_id => custom_checkboxes.id)
    custom_checkboxes_questions.each do |q|
      q.question_type_id = choose_one.id
      q.save
      q.question_attributes << QuestionAttribute.create(:question_option_id => display_as.id, :name => display_as.name, :value => "checkboxes")
    end
    custom_checkboxes.destroy


    #add display_as attribute to reading_question, don't delete type
    reading_question = QuestionType.find_by(:name => "reading_question")
    reading_question_questions = Question.where(:question_type_id => reading_question.id)
    reading_question_questions.each do |q|
      q.question_attributes << QuestionAttribute.create(:question_option_id => display_as.id, :name => display_as.name, :value => "radiobuttons")
    end

    puts "DONE"

  end
end
