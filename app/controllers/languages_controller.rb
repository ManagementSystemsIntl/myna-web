class LanguagesController < ApiController
  before_action :set_language, only: [:show, :update, :destroy]

  # GET /languages
  # GET /languages.json
  def index
    # if params[:is_default].present? && params[:is_default] == "true"
    #   @language = Language.where(:survey_group_id => params[:group_id], :default_language => true).first
    #   render :show
    # elsif params[:is_default].present? && params[:is_default] == "false"
    #   @languages = Language.where(:survey_group_id => params[:group_id], :default_language => false)
    # else
    @languages = Language.where(:survey_group_id => params[:survey_group_id])
    # end
  end

  # GET /languages/1
  # GET /languages/1.json
  def show
  end

  # POST /languages
  # POST /languages.json
  def create
    @language = Language.new(language_params)
    if @language.save
      render :show, status: :created, location: @language
    else
      render json: @language.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /languages/1
  # PATCH/PUT /languages/1.json
  def update
    if @language.update(language_params)
      render :show, status: :ok, location: @language
    else
      render json: @language.errors, status: :unprocessable_entity
    end
  end

  # DELETE /languages/1
  # DELETE /languages/1.json
  def destroy
    @language.destroy
    head :no_content
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_language
      @language = Language.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def language_params
      params.require(:language).permit(:name, :survey_group_id, :direction)
    end
end
