# class SurveyLanguagesController < ApiController
#   before_action :set_survey_language, only: [:show, :edit, :update, :destroy]
#
#   # GET /survey_languages
#   # GET /survey_languages.json
#   def index
#     @survey_languages = SurveyLanguage.all
#   end
#
#   # GET /survey_languages/1
#   # GET /survey_languages/1.json
#   def show
#   end
#
#   # GET /survey_languages/new
#   def new
#     @survey_language = SurveyLanguage.new
#   end
#
#   # GET /survey_languages/1/edit
#   def edit
#   end
#
#   # POST /survey_languages
#   # POST /survey_languages.json
#   def create
#     @survey_language = SurveyLanguage.new(survey_language_params)
#
#     respond_to do |format|
#       if @survey_language.save
#         format.html { redirect_to @survey_language, notice: 'Survey language was successfully created.' }
#         format.json { render :show, status: :created, location: @survey_language }
#       else
#         format.html { render :new }
#         format.json { render json: @survey_language.errors, status: :unprocessable_entity }
#       end
#     end
#   end
#
#   # PATCH/PUT /survey_languages/1
#   # PATCH/PUT /survey_languages/1.json
#   def update
#     respond_to do |format|
#       if @survey_language.update(survey_language_params)
#         format.html { redirect_to @survey_language, notice: 'Survey language was successfully updated.' }
#         format.json { render :show, status: :ok, location: @survey_language }
#       else
#         format.html { render :edit }
#         format.json { render json: @survey_language.errors, status: :unprocessable_entity }
#       end
#     end
#   end
#
#   # DELETE /survey_languages/1
#   # DELETE /survey_languages/1.json
#   def destroy
#     @survey_language.destroy
#     respond_to do |format|
#       format.html { redirect_to survey_languages_url, notice: 'Survey language was successfully destroyed.' }
#       format.json { head :no_content }
#     end
#   end
#
#   private
#     # Use callbacks to share common setup or constraints between actions.
#     def set_survey_language
#       @survey_language = SurveyLanguage.find(params[:id])
#     end
#
#     # Never trust parameters from the scary internet, only allow the white list through.
#     def survey_language_params
#       params.fetch(:survey_language, {})
#     end
# end
