class QuestionCategory < ActiveRecord::Base
  has_many :question_types
end
