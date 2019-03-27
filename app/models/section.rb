class Section < ActiveRecord::Base
  validates :survey_id, :name, :code, presence: true
  # validates :code, uniqueness: {scope: :survey_id, message: "Can't have duplicate code in single survey"}
  # validates :grade, # grades must be in survey.grade
  before_save :escape_rangy

  belongs_to :survey
  has_many :questions, dependent: :destroy
  has_paper_trail :on => [:update, :destroy], :skip => [:created_at, :id, :survey_id]

  default_scope { order(:order => :asc) }

  include VersionAsPublished
  include GetDiff

  def clone(survey_id)
    section_copy = self.deep_clone
    section_copy.survey_id = survey_id
    section_copy.save
    return section_copy
  end

  def escape_rangy
    unless self.hint.nil?
      hint = self.hint
      hint = hint.gsub(/(id=\"selectionBoundary).\d*.\d*\"/,"")
      hint = hint.gsub(/(&#65279;)/,"")
      hint = hint.gsub(/(class=\"rangySelectionBoundary\")/,"")
      hint = hint.gsub(/"/,"'")
      self.hint = hint
    end
  end

  def generate_schema
    questions = self.questions
    q_schema = questions.map{|q|
      q.version_as_published()
      q.build_schema_json()
    }.select{|q|
      q != ""
    }.each_with_object({}){|q,o| o[q[0]] = q[1] }

    f_schema = questions.map{|q|
      q.build_form_json()
    }

    submit = {}
    submit[:type] = "submit"
    submit[:title] = "Next"
    submit[:htmlClass] = "direction_ltr"

    f_schema << submit

    questions_json = {}
    questions_json[:schema] = {}
    questions_json[:schema][:type] = "object"
    questions_json[:schema][:properties] = q_schema
    questions_json[:form] = f_schema

    section_schema = {}
    section_schema[:config] = {}
    section_schema[:config][:hint] = self.hint
    section_schema[:config][:skippable] = self.skippable || -1
    section_schema[:config][:autostop] = self.autostop || -1
    section_schema[:config][:grade] = self.survey.grade
    section_schema[:questions] = questions_json

    return section_schema
  end

  def hydrate(section, survey, question_types, translations)
    self.update(:name => section["name"], :code => section["code"], :order => section["order"], :skippable => section["config"]["skippable"], :autostop => section["config"]["autostop"], :hint => section["config"]["hint"], :is_publishable => true, :grade => survey.grade, :survey_id => survey.id )

    section_translations = Hash.new
    translations.each do |l,t|
      t.each do |k,v|
        if /\A#{section["code"]}/.match(k)
          section_translations[k] = v
        elsif /\Achoice_/.match(k)
          section_translations[k] = v
        end
      end
    end

    section["questions"]["form"].each_with_index do |question_form, i|
      form_type = question_form["type"]
      next if form_type == "submit"

      question_schema = section["questions"]["schema"]["properties"][question_form["key"]]

      unless question_schema.nil?
        schema_type = question_schema["type"]
        has_enum = !question_schema["enum"].nil?
      else
        schema_type = question_form["type"]
      end
      has_titlemap = !question_form["titleMap"].nil?

      question = Question.new
      qtype = question.get_question_type(schema_type, question_form, has_enum, has_titlemap)
      question_type = question_types.find{|q| q.name == qtype}

      next if question_type.nil?

      question.hydrate(question_schema, question_form, survey_id, self.id, question_type, i, section_translations, section["code"])
    end
  end

end
