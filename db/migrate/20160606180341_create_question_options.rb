class CreateQuestionOptions < ActiveRecord::Migration
  def change
    create_table :question_options do |t|
      t.string :name
      t.string :option_type
      t.integer :question_type_id

      t.timestamps null: false
    end
  end
end
