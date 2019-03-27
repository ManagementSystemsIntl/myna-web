class AddFieldsToSurveyFamilyJoins < ActiveRecord::Migration
  def change
    add_column :survey_family_joins, :is_random, :boolean, default: false
    add_column :survey_family_joins, :order, :integer
  end
end
