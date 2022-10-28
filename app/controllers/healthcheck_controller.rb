class HealthcheckController < ApplicationController
  skip_before_action :authenticate_user!
  layout false

  before_action :set_cache_headers

  def check_db
    connection = ActiveRecord::Base.connection_pool.connected?
    status = connection ? :ok : :service_unavailable
    render json: {:connected => connection}, status: status
  end

  private

  def set_cache_headers
    response.headers["Cache-Control"] = "no-cache, no-store"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "Mon, 01 Jan 1990 00:00:00 GMT"
  end
end
  