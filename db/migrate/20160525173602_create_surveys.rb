class CreateSurveys < ActiveRecord::Migration
  def change
    create_table :surveys do |t|
      t.string :survey_type
      t.string :name
      t.string :grade
      t.integer :client_id
      t.integer :survey_group_id
      t.string :json_schema
      t.timestamp :last_published

      t.timestamps null: false
    end
  end
end
