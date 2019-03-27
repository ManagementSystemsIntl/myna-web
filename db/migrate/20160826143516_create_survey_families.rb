class CreateSurveyFamilies < ActiveRecord::Migration
  def change
    create_table :survey_families do |t|
      t.string :name
      t.integer :survey_group_id

      t.timestamps null: false
    end
  end
end
