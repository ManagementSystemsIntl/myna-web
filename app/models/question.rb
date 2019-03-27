class Question < ActiveRecord::Base
  validates :question_type_id, :section_id, :survey_id, presence: true

  belongs_to :survey
  belongs_to :section
  belongs_to :question_type
  belongs_to :choice_list
  has_many :question_attributes, dependent: :destroy
  has_paper_trail :on => [:update, :destroy], :skip => [:created_at, :id]

  default_scope { order(:order => :asc) }

  include VersionAsPublished
  include GetDiff

  def clone(survey_id,section_id)
    question_copy = self.deep_clone
    question_copy.survey_id = survey_id
    question_copy.section_id = section_id
    question_copy.save
    return question_copy
  end

  # Section.find(602).questions.find_by(:question_type_id => QuestionType.find_by(:name => 'grid'))

  def build_schema_json
    qt = self.question_type.name
    attributes = self.question_attributes
    # attributes.each do |a|
    #   a.version_as_published()
    # end

    attribute_list = self.question_type.question_options.pluck(:name)
    code = self.section.code
    has_number = self.question_type.has_number
    prefix_num = has_number ? self.question_number.to_s : self.order.to_s
    prefix = has_number ? "#{code}_#{prefix_num}" : "#{code}_o_#{prefix_num}"
    if attribute_list.include? "item_name"
      item_name = attributes.find_by(:name => 'item_name')
      item_key = "#{code}_#{item_name.value}"
    end

    schema = {}

    if ["single_choice","reading_question","short_text","long_text"].include? qt
      schema[:type] = "string"
    elsif ["multiple_choice","grid"].include? qt
      schema[:type] = "array"
    elsif ["confirm","consent"].include? qt
      schema[:type] = "boolean"
    elsif qt == "number"
      schema[:type] = "integer"
    else
      return ""
    end

    schema[:description] = item_key || prefix

    if attribute_list.include? "prompt"
      prompt = attributes.find_by(:name => "prompt")
      if self.question_type.has_number
        schema[:title] = "<span class=\"question_number\">#{prefix_num}</span>#{prefix}_prompt"
      else
        schema[:title] = "#{prefix}_prompt"
      end
    end

    if attribute_list.include? "choice"
      choice_list = self.choice_list
      unless qt == "multiple_choice"
        unless choice_list.nil?
          schema[:enum] = choice_list.question_attributes.order(order: :asc).pluck(:coded_value)
        else
          schema[:enum] = attributes.where(:name => "choice").order(order: :asc).pluck(:coded_value)
        end
      else
        schema[:items] = {}
        schema[:items][:type] = "string"
        unless choice_list.nil?
          schema[:items][:enum] = choice_list.question_attributes.order(order: :asc).pluck(:coded_value)
        else
          schema[:items][:enum] = attributes.where(:name => "choice").order(order: :asc).pluck(:coded_value)
        end
      end
    end

    if attribute_list.include? "grid_string"
      grid_string = attributes.find_by(:name => "grid_string")
      grid_splitter = grid_string.value.split("--").length > 1 ? "--" : " "
      grid_length = grid_string.value.split(grid_splitter).length
      schema[:items] = {}
      schema[:items][:type] = "string"
      schema[:items][:enum] = *(1..(grid_length))
    end

    if attribute_list.include? "minimum"
      minimum = attributes.find_by(:name => "minimum")
      schema[:minimum] = minimum.value
    end

    if attribute_list.include? "maximum"
      maximum = attributes.find_by(:name => "maximum")
      schema[:maximum] = maximum.value
    end

    if qt == "consent"
      main_code = "#{code}_consent"
    else
      main_code = item_key || prefix
    end

    return [main_code, schema]
  end

  def build_form_json
    qt = self.question_type.name
    attributes = self.question_attributes
    attributes.each do |a|
      a.version_as_published()
    end

    attribute_list = self.question_type.question_options.pluck(:name)
    code = self.section.code
    has_number = self.question_type.has_number
    prefix_num = has_number ? self.question_number.to_s : self.order.to_s
    prefix = has_number ? "#{code}_#{prefix_num}" : "#{code}_o_#{prefix_num}"
    if attribute_list.include? "item_name"
      item_name = attributes.find_by(:name => 'item_name')
      item_key = "#{code}_#{item_name.value}"
    end

    if qt == "consent"
      main_code = "#{code}_consent"
    else
      main_code = item_key || prefix
    end

    schema = {}
    unless qt == "readonly_text"
      schema[:key] = "#{main_code}"
    end

    if attribute_list.include? "display_as"
      if qt == "multiple_choice"
        schema[:type] = "checkboxes"
      else
        schema[:type] = attributes.find_by(:name => "display_as").value
      end
    elsif qt == "multiple_choice"
      schema[:type] = "checkboxes"
    elsif qt == "long_text"
      schema[:type] = "textarea"
    elsif qt == "grid"
      schema[:type] = "checkboxes"
    elsif ["confirm","consent"].include? qt
      schema[:type] = "checkbox"
    elsif qt == "readonly_text"
      prompt = attributes.find_by(:name => "prompt")
      schema[:type] = "help"
      schema[:helpvalue] = prefix+"_prompt"
    elsif qt == "timer"
      schema[:type] = "help"
      schema[:helpvalue] = ""
    end

    if attribute_list.include? "condition"
      condition = attributes.find_by(:name => "condition")
      unless !condition || condition.value == "" || !condition.value
        schema[:condition] = condition.value
      end
    end

    if attribute_list.include? "choice"
      choice_list = self.choice_list
      unless choice_list.nil?
        choices = choice_list.question_attributes.order(:order)
        schema[:titleMap] = choices.map{|c| {name: "choice_#{choice_list.id}_#{c.id}", value: c.coded_value} }
      else
        choices = attributes.where(:name => "choice").order(:order)
        schema[:titleMap] = choices.map{|c| {name: "#{prefix}_choice_#{c.id}", value: c.coded_value} }
      end
    end

    if qt == "grid"
      grid_width = attributes.find_by(:name => "grid_width")
      grid_string = attributes.find_by(:name => "grid_string")
      htmlClass = "grid grid-#{grid_width.value.to_s} survey_direction #{code}_grid_#{prefix_num}_timer #{code}_grid_#{prefix_num}_autostop gridName-#{item_key}"
      schema[:htmlClass] = htmlClass
      schema[:fieldHtmlClass] = "grid-item"
      schema[:labelHtmlClass] = "grid-label"
      grid_splitter = grid_string.value.split("--").length > 1 ? "--" : " "
      schema[:titleMap] = grid_string.value.split(grid_splitter).each_with_index.map{|g,i|
        {name: "#{prefix}_grid_string_#{i+1}", value: "#{(i+1).to_s}"}
      }
    elsif qt == "timer"
      htmlClass = "timer survey_direction #{code}_timer timerName-#{code}"
      schema[:htmlClass] = htmlClass
    else
      schema[:htmlClass] = "survey_direction"
      schema[:labelHtmlClass] = "normal-label"
    end
    return schema

  end

  def get_question_type(schema_type, question, has_enum, has_titlemap)
    if schema_type == "string"
      if !has_enum && !has_titlemap
        if question["type"] == "textarea"
          qytpe = "long_text"
        else
          qtype = "short_text"
        end
      elsif has_titlemap
        qtype = "single_choice"
      end
    elsif schema_type == "array"
      if /^grid/.match question["htmlClass"]
        qtype = "grid"
      else
        qtype = "multiple_choice"
      end
    elsif schema_type == "boolean"
      if /_consent$/.match question["key"]
        qtype = "consent"
      else
        qtype = "confirm"
      end
    elsif schema_type == "integer"
      qtype = "number"
    elsif schema_type == "help"
      if !question["key"].nil? && !/^timer/.match(question["htmlClass"]).nil?
        qtype = "timer"
      else
        qtype = "readonly_text"
      end
    end
    return qtype
  end

  def hydrate(question_schema, question_form, survey_id, section_id, question_type, order, translations, section_code)
    q_num = nil
    if question_type.has_number?
      q_num = question_form["key"].split("_").last.to_i
    end

    self.update(:order => order, :question_type_id => question_type.id, :section_id => section_id, :survey_id => survey_id, :question_number => q_num)

    question_translations = Hash.new
    translations.each do |k,v|
      if question_type.has_number? && /\A#{section_code}_#{q_num.to_s}/.match(k)
        question_translations[k] = v
      elsif /\A#{section_code}_o_#{order.to_s}/.match(k)
        question_translations[k] = v
      elsif /\A#{section_code}_grid_/.match(k)
        question_translations[k] = v
      elsif /\Achoice_/.match(k)
        question_translations[k] = v
      elsif /_timer/.match(k)
        question_translations[k] = v
      end
    end

    question_type.question_options.each do |qo|
      qa = QuestionAttribute.new(:question_option_id => qo.id, :name => qo.name, :question_id => self.id)
      qa.assign_values(question_translations, question_form, question_schema)
      qa.save if qa.valid?
    end
  end

  def get_tracking_path
    question_id = self.question_type.has_number ? "#{self.section.code}_#{self.question_number}" : "#{self.section.code}_consent"
    track = {}
    track[:survey_uuid] = self.survey.uuid
    track[:section_code] = self.section.code
    track[:question_code] = question_id
    track
  end

  def tracking
    self.question_attributes.find_by(:name => "trackable")
  end

end
