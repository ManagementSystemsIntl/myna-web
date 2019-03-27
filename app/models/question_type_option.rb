class QuestionTypeOption < ActiveRecord::Base
  belongs_to :question_type
  belongs_to :question_option 
end
