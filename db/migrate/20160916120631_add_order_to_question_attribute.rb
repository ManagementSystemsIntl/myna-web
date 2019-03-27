class AddOrderToQuestionAttribute < ActiveRecord::Migration
  def change
    add_column :question_attributes, :order, :integer
  end
end
