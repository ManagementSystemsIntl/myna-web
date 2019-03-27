class AddChoiceListToQuestionAttribute < ActiveRecord::Migration
  def change
    add_column :question_attributes, :choice_list_id, :integer
  end
end
