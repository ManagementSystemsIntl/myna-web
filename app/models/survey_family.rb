class SurveyFamily < ActiveRecord::Base
  validates :survey_group_id, :name, presence: true
  before_create :assign_uuid

  belongs_to :survey_group
  has_many :survey_family_joins, dependent: :destroy
  has_many :surveys, through: :survey_family_joins
  has_many :schemas, as: :publishing
  has_one :survey_target, as: :targetable
  has_paper_trail :on => [:update, :destroy], :skip => [:created_at, :id, :uuid]
  default_scope { order(:id => :asc) }

  def family_schema
    surveys = self.survey_family_joins.map{|d|
      {random: d.is_random, order: d.order, uuid: d.survey.uuid, grade: d.survey.grade}
    }
    iteration = self.schemas.length > 0 ? self.schemas.last.iteration + 1 : 1

    schema = {}
    schema[:doc_type] = "schema-family"
    schema[:active] = self.is_active
    schema[:survey_info] = {}
    schema[:survey_info][:uuid] = self.uuid
    schema[:survey_info][:name] = self.name
    schema[:survey_info][:surveys] = surveys
    schema[:survey_info][:iteration] = iteration
    schema[:survey_info][:gold_standards] = self.gold_standards
    schema[:survey_info][:targets] = {target: nil, irr_target: nil}
    unless self.survey_target.nil?
      schema[:survey_info][:targets][:target] = self.survey_target.value
      schema[:survey_info][:targets][:irr_target] = self.survey_target.irr_value
    end
    # tracking = []
    # self.surveys.each do |survey|
    #   unless survey.schemas.nil?
    #     tracks = JSON.parse(survey.schemas.first.json_schema)["tracking"]
    #     unless !tracks.nil? && tracks.length == 0
    #       tracking << tracks
    #     end
    #   end
    # end
    # schema[:tracking] = tracking.flatten

    return schema.to_json
  end

  def assign_uuid
    self.uuid = SecureRandom.uuid
  end

end
