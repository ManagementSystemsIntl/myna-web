class TranslationsController < ApiController
  before_action :set_translation, only: [:show, :update, :destroy]
  before_action :authenticate_user!

  # GET /translations
  # GET /translations.json
  def index
    @translations = Translation.where(:question_attribute_id => params[:question_attribute_id])
  end

  # GET /translations/1
  # GET /translations/1.json
  def show
  end

  # PATCH/PUT /translations/1
  # PATCH/PUT /translations/1.json
  def update
    if @translation.update(translation_params)
      render :show, status: :ok, location: @translation
    else
      render json: @translation.errors, status: :unprocessable_entity
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_translation
      @translation = Translation.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def translation_params
      params.require(:translation).permit(:value)
    end
end
