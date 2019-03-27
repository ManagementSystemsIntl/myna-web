class QuestionsController < ApiController
  before_action :set_question, only: [:show, :update, :destroy]
  before_action :authenticate_user!

  # GET /questions
  # GET /questions.json
  def index
    if params[:section_id].nil?
      @questions = Question.where(:survey_id => params[:survey_id])
    else
      @questions = Question.where(:survey_id => params[:survey_id], :section_id => params[:section_id])
    end
    @full = params[:full] === "true" ? true : false
  end

  # GET /questions/1
  # GET /questions/1.json
  def show
    @full = params[:full] === "true" ? true : false
  end

  # POST /questions
  # POST /questions.json
  def create
    @question = Question.new(question_params)
    if @question.save
      # @question.prepopulate_question
      @full = true
      render :show, status: :created, location: @question
    else
      render json: @question.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /questions/1
  # PATCH/PUT /questions/1.json
  def update
    @full = params[:full] === "true" ? true : false
    if @question.update(question_params)
      render :show, status: :ok, location: @question
    else
      render json: @question.errors, status: :unprocessable_entity
    end
  end

  # DELETE /questions/1
  # DELETE /questions/1.json
  def destroy
    @question.destroy
    head :no_content
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_question
      @question = Question.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def question_params
      params.require(:question).permit(:id, :order, :section_id, :survey_id, :question_type_id, :question_number, :choice_list_id)
    end
end
