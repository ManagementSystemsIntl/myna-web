class ConnectionsController < ApiController
  before_action :set_connection, only: [:show]
  before_action :authenticate_user!

  # GET /connections
  # GET /connections.json
  def index
    @connections = Connection.all
  end

  # GET /connections/1
  # GET /connections/1.json
  def show
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_connection
      @connection = Connection.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def connection_params
      params.fetch(:connection, {})
    end
end
