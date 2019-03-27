class RolesController < ApiController
  before_action :authenticate_user!

  def index
    @roles = Role.all
  end

end
