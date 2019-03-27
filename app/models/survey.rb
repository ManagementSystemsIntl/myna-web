class Survey < ActiveRecord::Base
  validates :survey_group_id, presence: true
  before_create :assign_uuid
  # before_save :count_missing_translations

  belongs_to :survey_group
  has_many :sections, dependent: :destroy
  has_many :questions, dependent: :destroy
  # has_many :versions, -> { where(:version => true) }, class_name: "Survey", foreign_key: "version_of"
  has_many :survey_languages
  has_many :languages, through: :survey_languages
  # belongs_to :language
  has_many :translations, through: :languages
  has_many :survey_family_joins, dependent: :destroy
  has_many :survey_families, through: :survey_family_joins
  has_one :survey_target, as: :targetable
  has_many :schemas, as: :publishing
  has_paper_trail :on => [:update, :destroy], :skip => [:created_at, :id, :missing_translations, :is_clone, :version, :cloned_from, :version_of, :survey_group_id, :version_number, :uuid]

  default_scope { order(:id => :asc) }

  include VersionAsPublished
  include GetDiff

  def clone(group_id, name)
    survey_copy = self.deep_clone
    survey_copy.name = name
    survey_copy.survey_group_id = group_id
    survey_copy.is_clone = true
    survey_copy.cloned_from = self.uuid
    survey_copy.save
    return survey_copy
  end

  def publish_schema
    sections = self.sections.where(:is_publishable => true)
    sections_json = make_sections_json(sections)
    # languages = self.languages
    # potfile_json = make_potfile_json(languages)
    dir = self.languages.first.direction
    potfile_json = make_potfile_json(sections,dir)
    survey_info = self.make_survey_info_json
    # tracking_json = self.get_tracked_questions
    self.version_as_published()

    json_schema = {}
    json_schema[:doc_type] = "schema"
    json_schema[:survey_info] = survey_info
    json_schema[:sections] = sections_json
    json_schema[:translations] = potfile_json
    # json_schema[:tracking] = tracking_json
    return json_schema.to_json
  end

  def make_sections_json(sections)
    return sections.map{|s|
      s.version_as_published()
      section_schema = s.generate_schema()

      section = {}
      section[:name] = s.name
      section[:code] = s.code
      section[:order] = s.order
      section[:config] = section_schema[:config]
      section[:questions] = section_schema[:questions]
      section
    }
  end

  def get_tracked_questions
    trackable_types = QuestionOption.find_by(:name => "trackable").question_types.pluck(:id)
    survey_trackable = self.questions.where("question_type_id IN (?)", trackable_types)
    tracked = survey_trackable.collect(&:question_attributes).flatten.select{|qa| qa.name ==  "trackable" && qa.value == "true" }
      .map{|qa| qa.question.get_tracking_path }
    tracked
  end

  def make_potfile_json(sections,dir)
    potfile = {}
    translations = []
    sections.collect(&:questions).flatten.each do |q|
      translations << q.question_attributes.joins(:question_option).merge(QuestionOption.where(:translatable => true))
    end
    l_a = map_qa_as_translations(translations.flatten,dir)
    l_a = map_choice_list_translations(l_a,self.survey_group.choice_lists)
    l_a[:survey_direction] = "direction_#{dir}"
    potfile[:language] = l_a
    return potfile
  end

  def map_choice_list_translations(l_a,lists)
    lists.each do |list|
      list.question_attributes.each do |qa|
        key = "choice_#{list.id}_#{qa.id}"
        l_a[key.to_sym] = qa.value
      end
    end
    return l_a
  end

  def map_qa_as_translations(l_t,dir)
    translations = {}
    l_t.each do |t|
      section_code = t.question.section.code
      has_number = t.question.question_type.has_number
      prefix_num = has_number ? t.question.question_number.to_s : t.question.order.to_s
      prefix = has_number ? "#{section_code}_#{prefix_num}" : "#{section_code}_o_#{prefix_num}"

      att_type = t.name
      field_code = [prefix,att_type].join("_")
      if att_type == "grid_string"
        grid_splitter = t.value.split("--").length > 1 ? "--" : " "
        t_list = t.value.split(grid_splitter)
        t_list.each_with_index.map {|tr,i|
          translations["#{field_code}_#{i+1}".to_sym] = tr
        }
      elsif att_type == "choice"
        field_code = [prefix,att_type,t.id].join("_")
        translations[field_code.to_sym] = t.value
      elsif att_type == "grid_timer"
        qt = t.question.question_type.name
        if qt == "timer"
          translations["#{section_code}_timer".to_sym] = "timer-#{t.value.to_s}"
        else
          translations["#{section_code}_grid_#{prefix_num}_timer".to_sym] = "timer-#{t.value.to_s}"
        end
      elsif att_type == "grid_autostop"
        translations["#{section_code}_grid_#{prefix_num}_autostop".to_sym] = "autostop-#{t.value.to_s}"
      else
        translations[field_code.to_sym] = t.value
      end
    end
    return translations
  end

  def make_survey_info_json
    # name = self.name == "" ? "NO_NAME" : self.name
    # grade = self.grade == "" ? "NO_GRADE" : self.grade
    iteration = self.schemas.length > 0 ? self.schemas.first.iteration + 1 : 1
    #^^ first because order?
    survey_info = {}
    survey_info[:uuid] = self.uuid
    survey_info[:iteration] = iteration
    survey_info[:name] = self.name
    survey_info[:survey_type] = self.survey_type
    survey_info[:gold_standards] = self.gold_standards
    survey_info[:grade] = self.grade
    survey_info[:targets] = {target: nil, irr_target: nil}
    unless self.survey_target.nil?
      survey_info[:targets][:target] = self.survey_target.value
      survey_info[:targets][:irr_target] = self.survey_target.irr_value
    end
    return survey_info
  end

  def assign_uuid
    self.uuid = SecureRandom.uuid
  end

  def count_missing_translations
    self.missing_translations = self.translations.where(:value => [nil,""]).length
  end

end
