class AddSchoolCountToSurveyGroups < ActiveRecord::Migration
  def change
    add_column :survey_groups, :school_count, :integer
  end
end
