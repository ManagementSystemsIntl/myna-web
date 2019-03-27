class SurveyTarget < ActiveRecord::Base

  belongs_to :targetable, polymorphic: true

end
