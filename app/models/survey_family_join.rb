class SurveyFamilyJoin < ActiveRecord::Base
  validates_uniqueness_of :id, :scope => [:survey_id, :survey_family_id]
  belongs_to :survey
  belongs_to :survey_family
end
