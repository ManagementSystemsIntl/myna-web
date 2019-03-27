class PouchKey < ActiveRecord::Base
  before_create :assign_external_key
  validates :survey_group_id, presence: true
  validates_uniqueness_of :external_key

  belongs_to :survey_group

  def assign_external_key
    external_key = SecureRandom.hex(4)
    if PouchKey.find_by(:external_key => external_key).nil?
      self.external_key = external_key
    else
      assign_external_key
    end
  end
end
