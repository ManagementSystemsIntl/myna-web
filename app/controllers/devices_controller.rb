class DevicesController < ApiController
  before_action :set_device, only: [:show]
  before_action :authenticate_user! , except: [:connect]

  # GET /devices
  # GET /devices.json
  def index
    @devices = Device.all
  end

  # GET /devices/1
  # GET /devices/1.json
  def show
  end

  # POST /connect/:pouch_code/device/:serial_number
  def connect
    @pouch_key = PouchKey.find_by(:external_key => params[:pouch_code])
    device = Device.find_or_initialize_by(:serial_number => params[:serial_number])

    device.version = params[:version]
    device.app_version = params[:app_version]
    device.platform = params[:platform]
    device.cordova = params[:cordova]
    device['model'] = params[:model]
    device.uuid = params[:uuid]

    device.external_code = params[:pouch_code]
    if @pouch_key
      device.survey_group_id = @pouch_key.survey_group_id
      if device.save
        # device.deactivate_existing_connections
        active = device.connections.find_by(:active => true)
        unless active.nil?
          active.update(:active => false)
        end
        Connection.create(:device_id => device.id, :survey_group_id => device.survey_group_id)
        render template: "pouch_keys/show"
      else
        render json: {:error => "device-not-saved"}, status: :unprocessable_entity
      end
    else
      device.save
      render json: {:error => "not-found"}, status: :not_found
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_device
      @device = Device.find_by(:serial_number => params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def device_params
      params.require(:device).permit(:serial_number, :version, :app_version, :platform, :cordova, :model, :uuid)
    end
end
