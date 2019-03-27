class QuestionTypesController < ApiController
  before_action :set_question_type, only: [:show, :update]
  before_action :authenticate_user!

  def index
    @question_types = QuestionType.all
  end

  def show
  end

  # POST /question_types
  # POST /question_types.json
  def create
    @question_type = QuestionType.new(question_type_params)
    if params["options"]
      @question_type.question_options = QuestionOption.find(params["options"].split(","))
    end
    if @question_type.save
      render :show, status: :created, location: @question_type
    else
      render json: @question_type.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /question_types/1
  # PATCH/PUT /question_types/1.json
  def update
    if params["options"]
      @question_type.question_options = QuestionOption.where(:id => params["options"].split(","))
    end
    if @question_type.update(question_type_params)
      render :show, status: :ok, location: @question_type
    else
      render json: @question_type.errors, status: :unprocessable_entity
    end
  end

  # DELETE /question_types/1
  # DELETE /question_types/1.json
  def destroy
    @question_type.destroy
    head :no_content
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_question_type
      @question_type = QuestionType.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def question_type_params
      params.require(:question_type).permit(:id, :name, :descriptive, :has_number, :question_category_id)
    end
end
