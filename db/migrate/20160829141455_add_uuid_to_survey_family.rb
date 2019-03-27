class AddUuidToSurveyFamily < ActiveRecord::Migration
  def change
    add_column :survey_families, :uuid, :string
  end
end
