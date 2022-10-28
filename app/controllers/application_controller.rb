class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception
  before_filter :set_constants

  # used in application.html.erb to remove sidebar from layout
  def set_constants
    set_session_projects
    @controller = params[:controller]
    @client = session[:project_name] || ""
    @ability = Ability.new(current_user)
  end

  def set_session_projects
    if session[:project_id] == nil && current_user != nil
      session[:project_id] = current_user.default_project
    end

    if session[:project_id] != nil && session[:project_name] == nil
      session[:project_name] = Project.find(session[:project_id]).name
    end

    if session[:project_list] == nil && current_user != nil
      session[:project_list] = current_user.project_list
    end
  end


  # Lograge method for adding extra info to Logging
  def append_info_to_payload(payload)
    super
    payload[:remote_ip] = request.remote_ip
    payload[:user_id] = if current_user.present?
      current_user.try(:id)
    else
      :guest
    end
  end

end
