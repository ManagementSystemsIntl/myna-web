class QuestionAttributesController < ApiController
  before_action :set_question_attribute, only: [:show, :update, :destroy]
  before_action :authenticate_user!

  def index
    @translatable = params[:translatable]
    if params[:question_id]
      @question_attributes = QuestionAttribute.where(:question_id => params[:question_id])
    elsif params[:survey_id]
      attributes = Question.where(:survey_id => params[:survey_id]).map {|q| q.question_attributes}.flatten
      @question_attributes = attributes.select do |a|
        a.question_option.translatable?
      end
    end
  end

  def show
  end

  # POST /question_attributes
  # POST /question_attributes.json
  def create
    @question_attribute = QuestionAttribute.new(question_attribute_params)
    if @question_attribute.save
      @question_attribute.create_translations
      # @question_attribute.update_default_translations
      render :show, status: :created, location: @question_attribute
    else
      render json: @question_attribute.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /question_attributes/1
  # PATCH/PUT /question_attributes/1.json
  def update
    if @question_attribute.update(question_attribute_params)
      # @question_attribute.update_default_translations
      render :show, status: :ok, location: @question_attribute
    else
      render json: @question_attribute.errors, status: :unprocessable_entity
    end
  end

  # DELETE /question_attributes/1
  # DELETE /question_attributes/1.json
  def destroy
    @question_attribute.destroy
    head :no_content
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_question_attribute
      @question_attribute = QuestionAttribute.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def question_attribute_params
      params.require(:question_attribute).permit(:question_option_id, :name, :value, :question_id, :survey_id, :survey_group_id, :coded_value, :order)
    end
end
