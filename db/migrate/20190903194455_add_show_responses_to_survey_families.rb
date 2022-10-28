class AddShowResponsesToSurveyFamilies < ActiveRecord::Migration
  def change
    add_column :survey_families, :show_responses, :boolean, :default => false
  end
end
