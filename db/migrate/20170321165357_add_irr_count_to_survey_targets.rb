class AddIrrCountToSurveyTargets < ActiveRecord::Migration
  def change
    add_column :survey_targets, :irr_value, :integer
  end
end
