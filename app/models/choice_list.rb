class ChoiceList < ActiveRecord::Base
  has_many :question_attributes, dependent: :destroy
  has_many :questions
  belongs_to :survey_group
  belongs_to :language
end
