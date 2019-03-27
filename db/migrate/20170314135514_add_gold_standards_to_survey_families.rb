class AddGoldStandardsToSurveyFamilies < ActiveRecord::Migration
  def change
    add_column :survey_families, :gold_standards, :string
  end
end
