class CreateQuestionAttributes < ActiveRecord::Migration
  def change
    create_table :question_attributes do |t|
      t.integer :question_option_id
      t.string :name
      t.string :value
      t.integer :question_id

      t.timestamps null: false
    end
  end
end
