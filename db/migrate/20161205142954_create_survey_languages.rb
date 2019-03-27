class CreateSurveyLanguages < ActiveRecord::Migration
  def change
    create_table :survey_languages do |t|
      t.integer :survey_id
      t.integer :language_id

      t.timestamps null: false
    end
  end
end
