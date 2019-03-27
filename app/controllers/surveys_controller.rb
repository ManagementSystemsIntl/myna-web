class SurveysController < ApiController
  before_action :set_survey, only: [:show, :update, :destroy, :publish_schema, :clones, :versions, :create_clone, :update_target, :update_active, :latest_schema]
  before_action :authenticate_user!

  def index
    unless params["all"] == "true"
      @surveys = Survey.where(:survey_group_id => params[:survey_group_id], :version => false)
    else
      @classify = true
      @include_last_schema = true
      @include_tracking = true
      @surveys = Survey.all
    end
  end

  def show
  end

  def create
    @survey = Survey.new(survey_params)
    survey_languages = params["languages"].split(",")
    if @survey.save
      survey_languages.each do |l|
        SurveyLanguage.create({:survey_id => @survey.id, :language_id => l})
      end
      render :show, status: :created, location: @survey
    else
      render json: @survey.errors, status: :unprocessable_entity
    end
  end

  def publish_schema
    @schema = @survey.publish_schema()
    if @schema
      render :show, status: :ok, location: @survey
    else
      render json: @survey.errors, status: :unprocessable_entity
    end
  end

  def upload_schema
    schema = JSON.parse(params["json_schema"])
    survey = Survey.find(params["survey_id"])
    unless schema["doc_type"] == "schema"
      render json: {error: "not a schema document"}, status: :unprocessable_entity
    end

    survey.sections.destroy_all
    question_types = QuestionType.all
    translations = schema["translations"]

    schema["sections"].each do |section|
      Section.new.hydrate(section, survey, question_types, translations)
    end

    render json: schema, status: :ok
  end

  def update_target
    type = params["type"]
    value = params["value"].to_i

    target = @survey.survey_target
    if target.nil?
      @survey.survey_target = SurveyTarget.new
      target = @survey.survey_target
    end

    if type == "irr_target"
      target.irr_value = value
    elsif type == "target"
      target.value = value
    end

    if target.save
      @classify = true
      @include_last_schema = true
      @include_tracking = true
      render :show, status: :ok, location: @survey
    else
      render json: target.errors, status: :unprocessable_entity
    end
  end

  def update_active
    @survey.is_active = params["is_active"]
    if @survey.save
      @classify = true
      @include_last_schema = true
      @include_tracking = true
      render :show, status: :ok, location: @survey
    else
      render json: @survey.errors, status: :unprocessable_entity
    end
  end

  def update
    @survey.survey_languages = []
    survey_languages = params["languages"].split(",")
    if @survey.update(survey_params)
      survey_languages.each do |l|
        @survey.survey_languages << SurveyLanguage.create({:survey_id => @survey.id, :language_id => l})
      end
      render :show, status: :ok, location: @survey
    else
      render json: @survey.errors, status: :unprocessable_entity
    end
  end

  def latest_schema
    schema = @survey.schemas.first
    if schema
      render json: schema, status: :ok
    else
      render json: @survey.errors, status: :unprocessable_entity
    end
  end

  def destroy
    @survey.destroy
    head :no_content
  end

  def clones
    @surveys = Survey.where(:cloned_from => @survey.uuid)
    render :index
  end

  def create_clone
    survey_copy = @survey.clone(params[:group_id], params[:as])
    # @survey.languages.each do |language|
    #   language.clone(survey_copy.id)
    # end
    @survey.sections.each do |section|
      section_copy = section.clone(survey_copy.id)
      section.questions.each do |question|
        question_copy = question.clone(survey_copy.id,section_copy.id)
        question.question_attributes.each do |atty|
          atty_copy = atty.clone(question_copy.id)
          # atty.translations.each do |translation|
          #   translation_lang = survey_copy.languages.find_by(:name => translation.language.name)
          #   language_id = translation_lang.id
          #   translation_copy = translation.clone(language_id,atty_copy.id)
          # end
        end
      end
    end

    if survey_copy.id
      @survey = survey_copy
      render :show, status: :ok, location: @survey
    else
      render json: @survey.errors, status: :unprocessable_entity
    end

  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_survey
      @survey = Survey.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def survey_params
      params.require(:survey).permit(:survey_type, :survey_group_id, :grade, :name, :is_active, :languages, :gold_standards)
    end
end
