class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception
  before_filter :set_constants

  # used in application.html.erb to remove sidebar from layout
  def set_constants
    @controller = params[:controller]
    @client = Rails.application.secrets.client
    @ability = Ability.new(current_user)
  end

end
