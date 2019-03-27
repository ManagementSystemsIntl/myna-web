class QuestionCategoriesController < ApiController
  before_action :set_question_category, only: [:show]
  before_action :authenticate_user!

  def index
    @question_categories = QuestionCategory.all
  end

  def show
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_question_category
      @question_category = QuestionCategory.find(params[:id])
    end

    # # Never trust parameters from the scary internet, only allow the white list through.
    # def question_type_params
    #   params.require(:question_category).permit(:name, :id, :descriptive)
    # end
end
