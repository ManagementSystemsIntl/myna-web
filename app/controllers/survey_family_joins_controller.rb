# class SurveyFamilyJoinsController < ApiController
#   before_action :set_survey_family_join, only: [:show, :edit, :update, :destroy]
#
#   # GET /survey_family_joins
#   # GET /survey_family_joins.json
#   def index
#     @survey_family_joins = SurveyFamilyJoin.all
#   end
#
#   # GET /survey_family_joins/1
#   # GET /survey_family_joins/1.json
#   def show
#   end
#
#   # GET /survey_family_joins/new
#   def new
#     @survey_family_join = SurveyFamilyJoin.new
#   end
#
#   # GET /survey_family_joins/1/edit
#   def edit
#   end
#
#   # POST /survey_family_joins
#   # POST /survey_family_joins.json
#   def create
#     @survey_family_join = SurveyFamilyJoin.new(survey_family_join_params)
#
#     respond_to do |format|
#       if @survey_family_join.save
#         format.html { redirect_to @survey_family_join, notice: 'Survey family join was successfully created.' }
#         format.json { render :show, status: :created, location: @survey_family_join }
#       else
#         format.html { render :new }
#         format.json { render json: @survey_family_join.errors, status: :unprocessable_entity }
#       end
#     end
#   end
#
#   # PATCH/PUT /survey_family_joins/1
#   # PATCH/PUT /survey_family_joins/1.json
#   def update
#     respond_to do |format|
#       if @survey_family_join.update(survey_family_join_params)
#         format.html { redirect_to @survey_family_join, notice: 'Survey family join was successfully updated.' }
#         format.json { render :show, status: :ok, location: @survey_family_join }
#       else
#         format.html { render :edit }
#         format.json { render json: @survey_family_join.errors, status: :unprocessable_entity }
#       end
#     end
#   end
#
#   # DELETE /survey_family_joins/1
#   # DELETE /survey_family_joins/1.json
#   def destroy
#     @survey_family_join.destroy
#     respond_to do |format|
#       format.html { redirect_to survey_family_joins_url, notice: 'Survey family join was successfully destroyed.' }
#       format.json { head :no_content }
#     end
#   end
#
#   private
#     # Use callbacks to share common setup or constraints between actions.
#     def set_survey_family_join
#       @survey_family_join = SurveyFamilyJoin.find(params[:id])
#     end
#
#     # Never trust parameters from the scary internet, only allow the white list through.
#     def survey_family_join_params
#       params.fetch(:survey_family_join, {})
#     end
# end
