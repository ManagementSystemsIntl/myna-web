class AddQuestionCategoryIdToQuestionTypes < ActiveRecord::Migration
  def change
    add_column :question_types, :question_category_id, :integer
  end
end
