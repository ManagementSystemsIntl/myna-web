class CreateSurveyTargets < ActiveRecord::Migration
  def change
    create_table :survey_targets do |t|
      t.integer :value
      t.integer :targetable_id
      t.string :targetable_type
      t.timestamps null: false
    end

    add_index :survey_targets, [:targetable_type, :targetable_id]
  end
end
