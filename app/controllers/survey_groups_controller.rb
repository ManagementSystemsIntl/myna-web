class SurveyGroupsController < ApiController
  before_action :set_survey_group, only: [:show, :update, :destroy]
  before_action :authenticate_user!

  # GET /survey_groups
  # GET /survey_groups.json
  def index
    @survey_groups = SurveyGroup.all
    @tree = params[:tree]
  end

  # GET /survey_groups/1
  # GET /survey_groups/1.json
  def show
  end

  # POST /survey_groups
  # POST /survey_groups.json
  def create
    @survey_group = SurveyGroup.new({:name => params[:name], :couch_user => params[:couch_user], :couch_pwd => params[:couch_pwd], :couch_domain => params[:couch_domain]})
    if @survey_group.save
      @survey_group.create_couch_dbs
      # @create = true
      # in jbuilder, compile and display errors in flash, pass to front end
      render :show, status: :created, location: @survey_group
    else
      render json: @survey_group.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /survey_groups/1
  # PATCH/PUT /survey_groups/1.json
  def update
    if @survey_group.update(survey_group_params)
      render :show, status: :ok, location: @survey_group
    else
      render json: @survey_group.errors, status: :unprocessable_entity
    end
  end

  # DELETE /survey_groups/1
  # DELETE /survey_groups/1.json
  def destroy
    @survey_group.destroy
    head :no_content
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_survey_group
      @survey_group = SurveyGroup.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def survey_group_params
      params.require(:survey_group).permit(:name, :couch_user, :couch_pwd, :couch_domain)
    end
end
