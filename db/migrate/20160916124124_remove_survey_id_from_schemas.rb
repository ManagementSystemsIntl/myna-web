class RemoveSurveyIdFromSchemas < ActiveRecord::Migration
  def change
    remove_column :schemas, :survey_id
  end
end
