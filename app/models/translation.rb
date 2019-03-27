class Translation < ActiveRecord::Base
  validates_uniqueness_of :id, :scope => [:language_id, :question_attribute_id]
  validates :question_attribute_id, :language_id, presence: true
  # before_save :escape_rangy

  belongs_to :language
  belongs_to :question_attribute
  has_paper_trail :on => [:update, :destroy], :skip => [:created_at, :id]

  include VersionAsPublished
  include GetDiff

  def clone(language_id, question_attribute_id)
    translation_copy = self.deep_clone
    translation_copy.language_id = language_id
    translation_copy.question_attribute_id = question_attribute_id
    translation_copy.save
    return translation_copy
  end

  # def escape_rangy
  #   value = self.value
  #   binding.pry
  #   # value = value.gsub(/(id=\"selectionBoundary)(.*\")/,"")
  #   value = value.gsub(/(id=\"selectionBoundary).\d*.\d*\"/,"")
  #   value = value.gsub(/(&#65279;)/,"")
  #   value = value.gsub(/(class=\"rangySelectionBoundary\")/,"")
  #   self.value = value
  # end

end
