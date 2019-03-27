class Schema < ActiveRecord::Base
  validates :json_schema, :publishing_id, :publishing_type, presence: true
  before_create :assign_iteration

  belongs_to :publishing, polymorphic: true
  default_scope { order(:iteration => :desc) }

  def assign_iteration
    iterations = self.publishing.schemas.length
    self.iteration = iterations + 1
  end
end
