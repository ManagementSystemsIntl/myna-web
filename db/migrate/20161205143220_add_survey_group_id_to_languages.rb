class AddSurveyGroupIdToLanguages < ActiveRecord::Migration
  def change
    add_column :languages, :survey_group_id, :integer

    Language.all.each do |l|
      l.survey_group_id = l.survey.survey_group.id
      l.save
    end
  end
end
