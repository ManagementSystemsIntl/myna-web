class AddTranslatableToQuestionOptions < ActiveRecord::Migration
  def change
    add_column :question_options, :translatable, :boolean
  end
end
