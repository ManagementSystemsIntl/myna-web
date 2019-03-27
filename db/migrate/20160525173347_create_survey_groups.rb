class CreateSurveyGroups < ActiveRecord::Migration
  def change
    create_table :survey_groups do |t|
      t.string :name
      t.integer :client_id

      t.timestamps null: false
    end
  end
end
