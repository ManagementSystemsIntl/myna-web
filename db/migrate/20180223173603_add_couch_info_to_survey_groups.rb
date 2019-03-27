class AddCouchInfoToSurveyGroups < ActiveRecord::Migration
  def change
    add_column :survey_groups, :encrypted_couch_pwd, :string
    add_column :survey_groups, :encrypted_couch_pwd_iv, :string
    add_column :survey_groups, :couch_domain, :string
    add_column :survey_groups, :couch_user, :string
  end
end
