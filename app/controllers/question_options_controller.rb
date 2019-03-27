class QuestionOptionsController < ApiController
  before_action :set_question_attribute, only: [:show]
  before_action :authenticate_user!

  # GET /question_options
  # GET /question_options.json
  def index
    if params[:question_type_id]
      @question_options = QuestionType.find(params[:question_type_id]).question_options
    else
      @question_options = QuestionOption.all
    end
  end

  def show
  end

  def create
    @question_option = QuestionOption.new(question_option_params)
    if @question_option.save
      render :show, status: :created, location: @question_option
    else
      render json: @question_option.errors, status: :unprocessable_entity
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_question_attribute
      @question_option = QuestionOption.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def question_option_params
      params.require(:question_option).permit(:question_type_id)
    end
end
