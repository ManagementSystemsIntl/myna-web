class SurveyLanguage < ActiveRecord::Base
  validates_uniqueness_of :id, :scope => [:survey_id, :language_id]

  belongs_to :survey
  belongs_to :language
end
