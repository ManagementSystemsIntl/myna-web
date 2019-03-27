class PouchKeysController < ApiController
  before_action :set_pouch_key, only: [:show,:update,:destroy]
  before_action :authenticate_user!, except: [:connect]

  # GET /pouch_keys
  # GET /pouch_keys.json
  def index
    @pouch_key = PouchKey.where(:survey_group_id => params[:survey_group_id]).first
    render :show
  end

  # GET /pouch_keys/1
  # GET /pouch_keys/1.json
  def show
  end

  # POST /pouch_keys
  # POST /pouch_keys.json
  def create
    @pouch_key = PouchKey.new(pouch_key_params)
    if @pouch_key.save
      render :show, status: :created, location: @pouch_key
    else
      render json: @pouch_key.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /pouch_keys/1
  # PATCH/PUT /pouch_keys/1.json
  def update
    if @pouch_key.update(pouch_key_params)
      render :show, status: :ok, location: @pouch_key
    else
      render json: @pouch_key.errors, status: :unprocessable_entity
    end
  end

  # DELETE /pouch_keys/1
  # DELETE /pouch_keys/1.json
  def destroy
    @pouch_key.destroy
    head :no_content
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_pouch_key
      @pouch_key = PouchKey.find_by(:survey_group_id => params[:survey_group_id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def pouch_key_params
      params.require(:pouch_key).permit(:survey_group_id,:username,:pwd,:db_name,:db_address)
    end
end
