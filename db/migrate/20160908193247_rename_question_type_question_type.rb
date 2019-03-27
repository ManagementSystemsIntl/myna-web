class RenameQuestionTypeQuestionType < ActiveRecord::Migration
  def change
    rename_column :question_types, :question_type, :name
  end
end
