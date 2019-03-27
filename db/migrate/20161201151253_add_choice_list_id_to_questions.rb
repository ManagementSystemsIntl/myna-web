class AddChoiceListIdToQuestions < ActiveRecord::Migration
  def change
    add_column :questions, :choice_list_id, :integer
  end
end
