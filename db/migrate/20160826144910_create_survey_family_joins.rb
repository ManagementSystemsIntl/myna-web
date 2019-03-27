class CreateSurveyFamilyJoins < ActiveRecord::Migration
  def change
    create_table :survey_family_joins do |t|
      t.integer :survey_family_id
      t.integer :survey_id
      t.timestamps null: false
    end
  end
end
