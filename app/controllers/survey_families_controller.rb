class SurveyFamiliesController < ApiController
  before_action :set_survey_family, only: [:show, :update, :destroy, :update_target, :update_active]
  before_action :authenticate_user!

  # GET /survey_familys
  # GET /survey_familys.json
  def index
    unless params["all"] == "true"
      @survey_families = SurveyFamily.where(:survey_group_id => params[:survey_group_id])
    else
      @classify = true
      @survey_families = SurveyFamily.all
    end
  end

  # GET /survey_familys/1
  # GET /survey_familys/1.json
  def show
  end

  # POST /survey_familys
  # POST /survey_familys.json
  def create
    @survey_family = SurveyFamily.new(survey_family_params)
    family_surveys = params["surveys"].split(",").map{|fs| fs.split("_")}
    if @survey_family.save
      family_surveys.each do |fs|
        SurveyFamilyJoin.create({:survey_id => fs[0].to_i, :survey_family_id => @survey_family.id, :is_random => fs[1], :order => fs[2]})
      end
      render :show, status: :created, location: @survey_family
    else
      render json: @survey_family.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /survey_familys/1
  # PATCH/PUT /survey_familys/1.json
  def update
    @survey_family.survey_family_joins = []
    family_surveys = params["surveys"].split(",").map{|fs| fs.split("_")}
    if @survey_family.update(survey_family_params)
      family_surveys.each do |fs|
        @survey_family.survey_family_joins << SurveyFamilyJoin.create({:survey_id => fs[0].to_i, :is_random => fs[1], :order => fs[2]})
      end
      render :show, status: :ok, location: @survey_family
    else
      render json: @survey_family.errors, status: :unprocessable_entity
    end
  end

  def update_target
    type = params["type"]
    value = params["value"].to_i

    target = @survey_family.survey_target
    if target.nil?
      @survey_family.survey_target = SurveyTarget.new
      target = @survey_family.survey_target
    end

    if type == "irr_target"
      target.irr_value = value
    elsif type == "target"
      target.value = value
    end

    if target.save
      @classify = true
      render :show, status: :ok, location: @survey_family
    else
      render json: target.errors, status: :unprocessable_entity
    end
  end

  def update_active
    @survey_family.is_active = params["is_active"]
    if @survey_family.save
      @classify = true
      render :show, status: :ok, location: @survey_family
    else
      render json: @survey_family.errors, status: :unprocessable_entity
    end
  end

  # DELETE /survey_familys/1
  # DELETE /survey_familys/1.json
  def destroy
    @survey_family.destroy
    head :no_content
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_survey_family
      @survey_family = SurveyFamily.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def survey_family_params
      params.require(:survey_family).permit(:name, :survey_group_id, :surveys, :is_active, :gold_standards, :show_responses)
    end
end
