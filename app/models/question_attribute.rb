class QuestionAttribute < ActiveRecord::Base
  validates :name, :question_option_id, presence: true
  validate :is_condition
  validate :is_associated

  # after_create :create_translations
  # after_save :update_default_translations
  before_save :escape_rangy

  belongs_to :question
  belongs_to :question_option
  belongs_to :choice_list
  has_many :translations, dependent: :destroy
  has_paper_trail :on => [:update, :destroy], :skip => [:created_at, :id]

  include VersionAsPublished
  include GetDiff

  def is_condition
    if self.name != "condition" && (self.value == "" || !self.value)
      errors[:base] << ("Question Attribute value is required")
    end
  end

  def is_associated
    unless [question_id?,choice_list_id?].include?(true)
      errors[:base] << ("This Question Attribute has to be associted to a Question or a Choice List.")
    end
  end

  def clone(question_id)
    atty_copy = self.deep_clone
    atty_copy.question_id = question_id
    atty_copy.save
    return atty_copy
  end

  def create_translations
    # unless self.question.survey.is_clone?
    languages = self.question.survey.languages
    if self.question_option.translatable?
      languages.each do |language|
        self.translations.create( :language_id => language.id )
      end
    end
    # end
  end

  def update_default_translations
    # unless self.question.survey.is_clone?
    if self.question_option.translatable?
      language = Language.find_by("survey_id"=>self.question.survey_id,"default_language"=>true)
      translation = self.translations.find_by("language_id"=>language.id)
      translation.value = self.value
      translation.save
    end
    # end
  end

  def escape_rangy
    unless self.value.nil?
      value = self.value
      value = value.gsub(/(id=\"selectionBoundary).\d*.\d*\"/,"")
      value = value.gsub(/(&#65279;)/,"")
      value = value.gsub(/(class=\"rangySelectionBoundary\")/,"")
      value = value.gsub(/"/,"'")
      self.value = value
    end
  end

  def assign_values(translations, form, schema)
    if self.name == "prompt"
      self.value = translations.find{|k,v| /_prompt$/.match(k)}[1]
    elsif self.name == "grid_string"
      self.value = translations.select{|k,v| /_grid_string_/.match(k) }.map{|k,v| [k.split("_").last.to_i, v]}.sort_by{|a| a[0]}.map{|a| a[1]}.join(" ")
    elsif self.name == "grid_width"
      self.value = form["htmlClass"].split(" ").find{|c| /grid-/.match(c)}.split("-")[1]
    elsif self.name == "grid_timer"
      begin
        self.value = translations.find{|k,v| /_grid_timer/.match(k)}[1].split("-")[1]
      rescue NoMethodError
        self.value = translations.find{|k,v| /_timer/.match(k)}[1].split("-")[1]
      end
    elsif self.name == "grid_autostop"
      # .* because didnt match _grid_autostop exactly
      self.value = translations.find{|k,v| /_grid.*_autostop/.match(k)}[1].split("-")[1]
    elsif self.name == "minimum"
      self.value = schema["minimum"]
    elsif self.name == "maximum"
      self.value = schema["maximum"]
    elsif self.name == "choice"
      if /_choice_/.match(form["titleMap"].first["name"])
        form["titleMap"].each_with_index do |c,i|
          choice = QuestionAttribute.new(self.attributes)
          choice.order = i
          choice.value = translations.find{|k,v| /#{c["name"]}/.match(k) }[1]
          choice.coded_value = c["value"]
          choice.save
        end
      else
        cl_id = form["titleMap"].first["name"].split("_")[1].to_i
        if self.question.survey.survey_group.choice_lists.find_by(:id => cl_id).nil?
          form["titleMap"].each_with_index do |c,i|
            choice = QuestionAttribute.new(self.attributes)
            choice.order = i
            choice.value = translations.find{|k,v| /#{c["name"]}/.match(k) }[1]
            choice.coded_value = c["value"]
            choice.save
          end
        else
          self.question.choice_list_id = cl_id
          self.question.save!
        end
      end
    elsif self.name == "condition"
      if !form["condition"].nil?
        self.value = form["condition"]
      end
    elsif self.name == "item_name"
      self.value = form["key"].gsub("#{self.question.section.code}_", "")
    elsif self.name == "display_as"
      unless form["type"].nil?
        self.value = form["type"]
      end
    end
  end

end
