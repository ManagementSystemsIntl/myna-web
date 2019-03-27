class QuestionType < ActiveRecord::Base
  validates :name, :descriptive, presence: true

  belongs_to :question_category
  has_many :question_type_options
  has_many :question_options, through: :question_type_options

end
