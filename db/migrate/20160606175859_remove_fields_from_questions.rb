class RemoveFieldsFromQuestions < ActiveRecord::Migration
  def change
    remove_column :questions, :prompt
    remove_column :questions, :grid_string
    remove_column :questions, :readonly_text
  end
end
