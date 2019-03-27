class AddHasNumberFieldToQuestionType < ActiveRecord::Migration
  def change
    add_column :question_types, :has_number, :boolean
  end
end
