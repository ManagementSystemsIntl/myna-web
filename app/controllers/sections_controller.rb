class SectionsController < ApiController
  before_action :set_section, only: [:show, :update, :destroy]
  before_action :authenticate_user!

  def index
    @sections = Section.where(:survey_id => params[:survey_id])
  end

  def show
  end

  def create
    @section = Section.new(section_params)
    if @section.save
      # if params[:shortcut]
      #   shortcut = params[:shortcut]
      #   if shortcut == "multiquestion"
      #     @section.create_multiquestion(params[:question_count])
      #   elsif shortcut == "grid"
      #     @section.create_grid()
      #   elsif shortcut == "reading"
      #     @section.create_reading(params[:question_count])
      #   end
      # end
      render :show, status: :created, location: @section
    else
      render json: @section.errors, status: :unprocessable_entity
    end
  end

  def update
    if @section.update(section_params)
      render :show, status: :ok, location: @section
    else
      render json: @section.errors, status: :unprocessable_entity
    end
  end

  def destroy
    @section.destroy
    head :no_content
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_section
      @section = Section.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def section_params
      params.require(:section).permit(:id, :survey_id, :name, :code, :order, :timer_value, :skippable, :autostop, :is_publishable, :grade, :hint)
    end
end
