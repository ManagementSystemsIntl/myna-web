class SchemasController < ApiController
  before_action :set_schema, only: [:show, :update]
  before_action :authenticate_user!
  # GET /schemas
  # GET /schemas.json
  def index
    @schemas = Schema.where(:publishing_id => params[:publishing_id], :publishing_type => params[:publishing_type].capitalize)
  end

  # GET /schemas/1
  # GET /schemas/1.json
  def show
  end

  # POST /schemas
  # POST /schemas.json
  def create
    @schema = Schema.new(schema_params)
    if @schema.save
      render :show, status: :created, location: @schema
    else
      render json: @schema.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /schemas/1
  # PATCH/PUT /schemas/1.json
  def update
    if @schema.update(schema_params)
      render :show, status: :ok, location: @schema
    else
      render json: @schema.errors, status: :unprocessable_entity
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_schema
      @schema = Schema.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def schema_params
      params.require(:schema).permit(:id, :iteration, :json_schema, :pouch_id, :publishing_id, :publishing_type)
    end
end
