class AddCodedValueToQuestionAttribute < ActiveRecord::Migration
  def change
    add_column :question_attributes, :coded_value, :string
  end
end
