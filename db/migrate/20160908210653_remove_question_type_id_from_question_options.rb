class RemoveQuestionTypeIdFromQuestionOptions < ActiveRecord::Migration
  def change
    remove_column :question_options, :question_type_id
  end
end
