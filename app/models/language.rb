class Language < ActiveRecord::Base
  validates :survey_group_id, :name, :direction, presence: true
  validates_uniqueness_of :name, :scope => :survey_group_id

  # after_create :create_translations

  belongs_to :survey_group
  has_many :surveys, through: :survey_languages
  has_many :choice_lists
  has_many :translations, :dependent => :destroy
  has_paper_trail :on => [:update, :destroy], :skip => [:created_at, :id]

  include VersionAsPublished
  include GetDiff

  # def clone(survey_id)
  #   language_copy = self.deep_clone
  #   language_copy.survey_id = survey_id
  #   language_copy.save
  #   return language_copy
  # end

  # def create_translations
  #   unless self.survey.is_clone?
  #     self.survey.questions.each do |question|
  #       question.question_attributes.each do |qa|
  #         if qa.question_option.translatable?
  #           self.translations.create( :question_attribute_id => qa.id )
  #         end
  #       end
  #     end
  #   end
  # end

end
