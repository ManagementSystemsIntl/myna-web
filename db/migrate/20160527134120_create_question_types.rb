class CreateQuestionTypes < ActiveRecord::Migration
  def change
    create_table :question_types do |t|
      t.string :schema_json
      t.string :form_json
      t.string :question_type
      t.string :descriptive

      t.timestamps null: false
    end
  end
end
