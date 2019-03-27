class QuestionOption < ActiveRecord::Base
  validates :name, :option_type, presence: true

  has_many :question_type_options
  has_many :question_types, through: :question_type_options
  has_many :question_attributes
end
