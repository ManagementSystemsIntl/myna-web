class RemoveSurveyIdFromLanguages < ActiveRecord::Migration
  def change
    remove_column :languages, :survey_id
  end
end
