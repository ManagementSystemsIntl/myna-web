class SurveyTargetsController < ApplicationController
  before_action :set_survey_target, only: [:show, :update]
  before_action :authenticate_user!

  # GET /survey_targets
  # GET /survey_targets.json
  def index
    @survey_targets = SurveyTarget.all
  end

  # GET /survey_targets/1
  # GET /survey_targets/1.json
  def show
  end

  # POST /survey_targets
  # POST /survey_targets.json
  def create
    @survey_target = SurveyTarget.new(survey_target_params)

    respond_to do |format|
      if @survey_target.save
        format.html { redirect_to @survey_target, notice: 'Survey target was successfully created.' }
        format.json { render :show, status: :created, location: @survey_target }
      else
        format.html { render :new }
        format.json { render json: @survey_target.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /survey_targets/1
  # PATCH/PUT /survey_targets/1.json
  def update
    respond_to do |format|
      if @survey_target.update(survey_target_params)
        format.html { redirect_to @survey_target, notice: 'Survey target was successfully updated.' }
        format.json { render :show, status: :ok, location: @survey_target }
      else
        format.html { render :edit }
        format.json { render json: @survey_target.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /survey_targets/1
  # DELETE /survey_targets/1.json
  def destroy
    @survey_target.destroy
    respond_to do |format|
      format.html { redirect_to survey_targets_url, notice: 'Survey target was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_survey_target
      @survey_target = SurveyTarget.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def survey_target_params
      params.fetch(:survey_target, {})
    end
end
