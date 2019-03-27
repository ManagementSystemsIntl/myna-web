class CreateQuestionTypeOptions < ActiveRecord::Migration
  def change
    create_table :question_type_options do |t|
      t.integer :question_type_id
      t.integer :question_option_id
      
      t.timestamps null: false
    end
  end
end
