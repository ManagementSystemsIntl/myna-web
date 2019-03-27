class CreateQuestions < ActiveRecord::Migration
  def change
    create_table :questions do |t|
      t.integer :order
      t.integer :question_type_id
      t.integer :section_id
      t.integer :survey_id
      t.string :prompt
      t.string :schema_json
      t.string :form_json
      t.string :grid_string
      t.string :readonly_text

      t.timestamps null: false
    end
  end
end
